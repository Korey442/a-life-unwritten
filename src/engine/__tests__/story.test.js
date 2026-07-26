import test from "node:test";
import assert from "node:assert/strict";
import { buildWorld, buildPlayer } from "../worldState.js";
import { progressStory, nextBeat, resolveStoryChoice, currentAct, beatFired, conditionsMet } from "../story.js";
import { STORY_BEATS } from "../../data/story.js";
import { LAYERS, isLayerUnlocked } from "../../data/layers.js";
import { findQuest } from "../quests.js";
import { startDive, resolveEncounter, endDive, inNet, currentEnemy } from "../dungeon.js";

const world = () => buildWorld(buildPlayer([], "テスト"));
const hi = () => 0.99; // 常に高ロール

// ターンを進めた（＝行動した）状態を作る
function atTurn(w, turn) {
  return { ...w, pacing: { ...w.pacing, turn } };
}

// 層を最初から最後まで踏破して地上へ戻る
function clearLayer(w, layerId) {
  let s = startDive(w, layerId);
  assert.equal(s.ok, true, `${layerId} に潜れること`);
  let cur = s.world;
  cur.player.condition = 100;
  for (let i = 0; i < 40 && inNet(cur); i++) {
    // 弱点を突き、高ロール固定で挑む（深層は弱点を突かないと前進できない＝設計どおり）
    const weak = currentEnemy(cur).weak?.[0] ?? "search";
    const r = resolveEncounter(cur, weak, hi);
    cur = r.world;
    cur.player.condition = 100; // 消耗はダンジョン側のテストで見るのでここでは回復させる
    if (r.result?.cleared) { cur = endDive(cur, "cleared").world; break; }
  }
  assert.ok(!inNet(cur), `${layerId} を踏破して地上へ戻ること`);
  return progressStory(cur, { max: 2 }).world;
}

// ---- 条件判定 ----
test("conditionsMet: 章・ターン・フラグ・場所を見る", () => {
  const w = world();
  assert.equal(conditionsMet(w, { act: 1 }), true);
  assert.equal(conditionsMet(w, { act: 2 }), false);
  assert.equal(conditionsMet(w, { act: [1, 3] }), true);
  assert.equal(conditionsMet(w, { minTurn: 1 }), false); // turn=0
  assert.equal(conditionsMet(atTurn(w, 3), { minTurn: 3 }), true);
  assert.equal(conditionsMet(w, { flags: ["anomaly"] }), false);
  assert.equal(conditionsMet(w, { notFlags: ["anomaly"] }), true);
  // 既定では地上でのみ発火する（潜行中に物語を差し込まない）
  assert.equal(conditionsMet({ ...w, location: "net" }, { act: 1 }), false);
});

// ---- 発火 ----
test("progressStory: 1回につき1ビートだけ発火し、二度は起きない", () => {
  const w = atTurn(world(), 1);
  const r1 = progressStory(w);
  assert.equal(r1.fired.length, 1);
  assert.equal(r1.fired[0].id, "a1_morning");
  assert.ok(beatFired(r1.world, "a1_morning"));
  assert.equal(r1.world.log.at(-1).kind, "story");
  // 同じターンでもう一度呼んでも、条件を満たす次のビートがなければ何も起きない
  assert.equal(progressStory(r1.world).fired.length, 0);
});

test("ビート本文の {name} は主人公名に置換される", () => {
  let w = atTurn(world(), 3);
  w = progressStory(w, { max: 2 }).world; // a1_morning → a1_haruka
  const text = w.log.map((e) => e.text).join("\n");
  assert.ok(text.includes("テスト"), "プレイヤー名が埋まる");
  assert.ok(!text.includes("{name}"), "プレースホルダが残らない");
});

test("第1章→第2章: 異変ビートが章を進め、次の『扉』ビートが第一層を開放する", () => {
  let w = atTurn(world(), 7);
  // a1_morning → a1_haruka → a1_omen → a1_break（1ターン1件ずつ）
  for (let i = 0; i < 4; i++) w = progressStory(w).world;
  assert.equal(currentAct(w), 2);
  assert.equal(w.story.anomaly, true);
  assert.equal(isLayerUnlocked(w, "sns_ruins"), false, "扉の場面より先には潜れない");

  w = progressStory(w).world; // a2_door
  assert.ok(isLayerUnlocked(w, "sns_ruins"));
  assert.equal(isLayerUnlocked(w, "frozen_ledger"), false, "先の層はまだ閉じている");
});

test("a1_break は a1_omen（予兆）を見ていないと発火しない", () => {
  const w = atTurn(world(), 99);
  const beat = nextBeat(w);
  assert.equal(beat.id, "a1_morning", "順序を飛ばさない");
  // 予兆を飛ばした状態を作ると、断絶は候補にならない
  const skipped = { ...w, story: { ...w.story, beats: ["a1_morning", "a1_haruka"] } };
  assert.equal(nextBeat(skipped).id !== "a1_break", true);
});

// ---- メインクエスト（物語が発行する背骨）----
test("a2_door がメインクエストを発行し、L4の提示枠を食わない", () => {
  let w = atTurn(world(), 7);
  for (let i = 0; i < 5; i++) w = progressStory(w).world; // …a1_break → a2_door
  const q = findQuest(w, "main_first_door");
  assert.ok(q, "メインクエストが提示される");
  assert.equal(q.main, true);
  assert.equal(q.status, "offered", "受注は強制されない（断ることもできる）");
  assert.equal(q.deadline, null, "メインに締切はない（放置しても失敗にならない）");
});

// ---- 復旧 → 章の進行（通し）----
test("第一層の復旧で第3章へ進み、次の層が開く（メインクエストも締まる）", () => {
  let w = atTurn(world(), 7);
  for (let i = 0; i < 5; i++) w = progressStory(w).world; // 第2章 + main_first_door 提示
  w = clearLayer(w, "sns_ruins");

  assert.ok(w.flags.includes("restored:sns_ruins"));
  assert.equal(currentAct(w), 3);
  assert.ok(isLayerUnlocked(w, "frozen_ledger"));
  assert.equal(findQuest(w, "main_first_door").status, "completed");
  assert.ok(findQuest(w, "main_deeper"), "次のメインクエストが提示される");
});

test("真実の開示: 第四層の復旧で終章へ進み、終層が開く", () => {
  let w = atTurn(world(), 7);
  for (let i = 0; i < 5; i++) w = progressStory(w).world;
  for (const id of ["sns_ruins", "frozen_ledger", "logistics_maze", "archive_hollow"]) w = clearLayer(w, id);

  assert.ok(w.flags.includes("truth_known"), "ミリナの正体が明かされる");
  assert.equal(currentAct(w), 4);
  assert.ok(isLayerUnlocked(w, "core_root"));
  assert.equal(findQuest(w, "main_deeper").status, "completed");
});

// ---- 結末の選択 ----
test("終層の踏破で選択待ちになり、選ぶまで他のビートは進まない", () => {
  let w = atTurn(world(), 7);
  for (let i = 0; i < 5; i++) w = progressStory(w).world;
  for (const id of Object.keys(LAYERS)) w = clearLayer(w, id);

  const pending = w.story.pending;
  assert.ok(pending, "選択待ちになる");
  assert.equal(pending.beatId, "a4_core");
  assert.equal(pending.choices.length, 3);
  assert.equal(nextBeat(w), null, "選択待ちの間は物語が止まる");

  const { world: after, ok } = resolveStoryChoice(w, "weave");
  assert.equal(ok, true);
  assert.equal(after.story.pending, null);
  assert.equal(after.story.ending, "weave");
  assert.equal(currentAct(after), 5);
  assert.ok(after.flags.includes("ending:weave"));
  assert.ok(after.log.at(-1).text.length > 0, "エピローグが刻まれる");
  // 選択は非可逆: 同じ選択をやり直せない
  assert.equal(resolveStoryChoice(after, "quench").ok, false);
});

test("3つの結末はすべて到達可能で、それぞれ別のフラグを残す", () => {
  let base = atTurn(world(), 7);
  for (let i = 0; i < 5; i++) base = progressStory(base).world;
  for (const id of Object.keys(LAYERS)) base = clearLayer(base, id);

  for (const [id, flag] of [["quench", "ending:quench"], ["weave", "ending:weave"], ["ignite", "ending:ignite"]]) {
    const { world: w, ok } = resolveStoryChoice(structuredClone(base), id);
    assert.equal(ok, true, `${id} を選べる`);
    assert.ok(w.flags.includes(flag));
    assert.equal(findQuest(w, "main_core").status, "completed");
  }
});

// ---- データの健全性 ----
test("ビート定義の健全性: ID重複なし・開放先の層が実在する", () => {
  const ids = STORY_BEATS.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length, "ビートIDが一意");
  for (const b of STORY_BEATS) {
    assert.ok(b.title && b.text, `${b.id} に本文がある`);
    const unlocks = [b.effects?.unlock ?? [], ...(b.choices ?? []).map((c) => c.effects?.unlock ?? [])].flat();
    for (const l of unlocks) assert.ok(LAYERS[l], `${b.id} が開放する層 ${l} が実在する`);
  }
  // すべての層が、いずれかのビートで開放される（到達不能な層を作らない）
  const allUnlocked = new Set(STORY_BEATS.flatMap((b) => b.effects?.unlock ?? []));
  for (const id of Object.keys(LAYERS)) assert.ok(allUnlocked.has(id), `層 ${id} は物語から開放される`);
});
