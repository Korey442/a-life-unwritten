import test from "node:test";
import assert from "node:assert/strict";
import { buildWorld, buildPlayer } from "../worldState.js";
import { progressStory, nextBeat, resolveStoryChoice, currentAct, beatFired, conditionsMet, fill } from "../story.js";
import { STORY_BEATS } from "../../data/story.js";
import { LAYERS, isLayerUnlocked } from "../../data/layers.js";
import { findQuest } from "../quests.js";
import { startDive, resolveEncounter, endDive, inNet, currentEnemy } from "../dungeon.js";
import { memoryViews, decayMemories, frayRatio } from "../memory.js";

const world = () => buildWorld(buildPlayer([], "テスト"));
const hi = () => 0.99; // 常に高ロール

// ターンを進めた（＝行動した）状態を作る
function atTurn(w, turn) {
  return { ...w, pacing: { ...w.pacing, turn } };
}

// 第1章のビートを順に消化して第2章に入るまで進める。
// 第1章にビートを足しても壊れないよう、回数ではなく「章が変わったか」で止める。
function toAct2(w) {
  let cur = atTurn(w, 7);
  for (let i = 0; i < 20 && currentAct(cur) < 2; i++) {
    const before = cur;
    cur = progressStory(cur).world;
    assert.notEqual(cur, before, "第1章のビートが進まなくなった");
  }
  assert.equal(currentAct(cur), 2, "第1章を消化して第2章へ入る");
  return cur;
}

// 第2章の「最初の扉」まで（＝第一層が開き、メインクエストが提示された状態）
const toFirstDoor = (w) => progressStory(toAct2(w)).world;

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
  const w = atTurn(world(), 3);
  assert.equal(fill("{name}のところへ行く", w), "テストのところへ行く");
  // 実際に流したビート本文にプレースホルダが残らないこと
  const text = progressStory(w, { max: 2 }).world.log.map((e) => e.text).join("\n");
  assert.ok(!text.includes("{name}"), "プレースホルダが残らない");
});

test("第1章→第2章: 異変ビートが章を進め、次の『扉』ビートが第一層を開放する", () => {
  // a1_morning → a1_others → a1_rumor → a1_omen → a1_break（1ターン1件ずつ）
  let w = toAct2(world());
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
  const skipped = { ...w, story: { ...w.story, beats: ["a1_morning", "a1_others"] } };
  assert.equal(nextBeat(skipped).id !== "a1_break", true);
});

// ---- メインクエスト（物語が発行する背骨）----
test("a2_door がメインクエストを発行し、L4の提示枠を食わない", () => {
  const w = toFirstDoor(world());
  const q = findQuest(w, "main_first_door");
  assert.ok(q, "メインクエストが提示される");
  assert.equal(q.main, true);
  assert.equal(q.status, "offered", "受注は強制されない（断ることもできる）");
  assert.equal(q.deadline, null, "メインに締切はない（放置しても失敗にならない）");
});

// ---- 復旧 → 章の進行（通し）----
test("第一層の復旧で第3章へ進み、次の層が開く（メインクエストも締まる）", () => {
  let w = toFirstDoor(world()); // 第2章 + main_first_door 提示
  w = clearLayer(w, "sns_ruins");

  assert.ok(w.flags.includes("restored:sns_ruins"));
  assert.equal(currentAct(w), 3);
  assert.ok(isLayerUnlocked(w, "frozen_ledger"));
  assert.equal(findQuest(w, "main_first_door").status, "completed");
  assert.ok(findQuest(w, "main_deeper"), "次のメインクエストが提示される");
});

test("真実の開示: 第四層の復旧で終章へ進み、終層が開く", () => {
  let w = toFirstDoor(world());
  for (const id of ["sns_ruins", "frozen_ledger", "logistics_maze", "archive_hollow"]) w = clearLayer(w, id);

  assert.ok(w.flags.includes("truth_known"), "ミリナの正体が明かされる");
  assert.equal(currentAct(w), 4);
  assert.ok(isLayerUnlocked(w, "core_root"));
  assert.equal(findQuest(w, "main_deeper").status, "completed");
});

// ---- 結末の選択 ----
test("終層の踏破で選択待ちになり、選ぶまで他のビートは進まない", () => {
  let w = toFirstDoor(world());
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
  let base = toFirstDoor(world());
  for (const id of Object.keys(LAYERS)) base = clearLayer(base, id);

  for (const [id, flag] of [["quench", "ending:quench"], ["weave", "ending:weave"], ["ignite", "ending:ignite"]]) {
    const { world: w, ok } = resolveStoryChoice(structuredClone(base), id);
    assert.equal(ok, true, `${id} を選べる`);
    assert.ok(w.flags.includes(flag));
    assert.equal(findQuest(w, "main_core").status, "completed");
  }
});

// ---- ダイブの代償（STORY.md「ダイブの代償 — ミリナの記憶」）----
test("記憶: 潜行1回につき1段階、潜った層のものから削れる", () => {
  const w = toFirstDoor(world());
  assert.equal(w.pacing.dives, 0, "まだ潜っていない");
  assert.ok(memoryViews(w).every((m) => m.stage === 0), "初期状態は全部無傷");

  const dived = startDive(w, "sns_ruins").world;
  assert.equal(dived.pacing.dives, 1);
  const sky = dived.npcs.milina.memories.find((e) => e.id === "sky_color");
  assert.equal(sky.stage, 1, "潜った層（声）の記憶から削れる");
  assert.equal(dived.npcs.milina.memories.filter((e) => e.stage > 0).length, 1, "1回で1段階だけ");
});

test("記憶: 彼女は黙っている（潜行が足した行に代償が漏れない）", () => {
  const before = toFirstDoor(world());
  // 潜行と撤退が新たに書き込んだ行だけを見る（過去のビート本文は対象外）
  const dived = startDive(before, "sns_ruins").world;
  const added = endDive(dived, "retreat").world.log.slice(before.log.length);
  assert.ok(added.length > 0, "潜行と撤退でログは増える");
  const text = added.map((e) => e.text).join("\n");
  for (const word of ["記憶", "忘れ", "失わ", "代償"]) {
    assert.ok(!text.includes(word), `代償がログに漏れている（「${word}」）→ プレイヤーは一覧で気づくべき`);
  }
});

test("記憶: 撤退すると余計に削れる（彼女が補填するため）", () => {
  const w = startDive(toFirstDoor(world()), "sns_ruins").world;
  const before = w.npcs.milina.memories.reduce((n, e) => n + e.stage, 0);
  const after = endDive(w, "retreat").world.npcs.milina.memories.reduce((n, e) => n + e.stage, 0);
  assert.equal(after, before + 1, "失敗のぶんが上乗せされる");
});

test("記憶: 段階ごとに見え方が変わる。title は最後まで残る", () => {
  const w = toFirstDoor(world());
  const stageOf = (n) => {
    const c = structuredClone(w);
    c.npcs.milina.memories.find((e) => e.id === "sky_color").stage = n;
    return memoryViews(c).find((m) => m.id === "sky_color");
  };
  assert.equal(stageOf(0).detail, "灰がかった、うすい水色");
  // ①はズレるだけで注記を出さない（彼女は気づいていない。プレイヤーだけが食い違いに気づく）
  assert.equal(stageOf(1).detail, "燃えるような夕焼け");
  assert.ok(!stageOf(1).unsure && !stageOf(1).lost);
  assert.ok(stageOf(2).unsure && stageOf(2).detail.includes("だったと思います"));
  assert.ok(stageOf(3).lost && stageOf(3).detail === "——");
  for (const n of [0, 1, 2, 3]) assert.ok(stageOf(n).title.length > 0, "title は最後まで残る");
});

test("記憶: 削り尽くしても壊れない（他の層のものへ回る）", () => {
  const w = toFirstDoor(world());
  const c = structuredClone(w);
  for (let i = 0; i < 200; i++) decayMemories(c, "sns_ruins", 1);
  assert.ok(c.npcs.milina.memories.every((e) => e.stage === 3), "全部失われて止まる");
  assert.equal(decayMemories(c, "sns_ruins", 1).length, 0, "もう削れるものが無ければ何も起きない");
  assert.equal(frayRatio(c), 1);
});

test("a3_lapse: 実際に記憶が削れてから発火する（折り返し）", () => {
  let w = toFirstDoor(world());
  w = clearLayer(w, "sns_ruins");
  w = clearLayer(w, "frozen_ledger"); // a3_ledger まで進む
  assert.ok(beatFired(w, "a3_ledger"));

  // 潜行回数が足りない状態では出ない
  const few = { ...w, pacing: { ...w.pacing, dives: 1 } };
  assert.equal(conditionsMet(few, { act: 3, beats: ["a3_ledger"], minDives: 2 }), false);

  w = progressStory(w).world;
  assert.ok(beatFired(w, "a3_lapse"), "第三層より前に折り返しが来る");
  assert.ok(w.flags.includes("lapse_seen"));
  assert.equal(beatFired(w, "a3_logistics"), false, "第三層の復旧より先には進まない");
});

// ---- ミリナの人格（CLAUDE.md「AIキャラクター設定：ミリナ」が正典）----
// 台詞は世代を重ねるほど崩れやすいので、崩れたら落ちるようにしておく。
const milinaLines = (b) => (b.dialogue ?? []).filter((d) => d.npc === "milina").map((d) => d.line);
const TSUN = /^[ぁ-んァ-ヶ一-龠]、/; // 「べ、別に」のような吃り出し＝ツンの合図
const POLITE = /(です|ます|まし|ません|ください|でしょ)/;

test("ミリナ: 一人称は「ミリナ」。自分を「私」と呼ばない", () => {
  for (const b of STORY_BEATS) {
    for (const line of milinaLines(b)) {
      // 『私』は「使えない言葉」としての引用なので許可（それ以外の素の「私」は禁止）。
      // 一人称が固有名である理由は STORY.md「観測痕跡としての固有名」。
      const bare = line.replaceAll(/『[^』]*』/g, "");
      assert.ok(!bare.includes("私"), `${b.id}: ミリナが自分を「私」と呼んでいる → ${line}`);
    }
  }
});

test("ミリナ: 主人公を「ご主人様」と呼ぶ（名前で呼ばない）", () => {
  for (const b of STORY_BEATS) {
    const lines = milinaLines(b);
    if (lines.length === 0) continue;
    for (const line of lines) {
      assert.ok(!line.includes("{name}"), `${b.id}: ミリナが主人公を名前で呼んでいる → ${line}`);
      assert.ok(POLITE.test(line), `${b.id}: です・ます調が崩れている → ${line}`);
    }
    assert.ok(lines.some((l) => l.includes("ご主人様")), `${b.id}: 「ご主人様」の呼びかけが1つもない`);
  }
});

test("ミリナ: ツンデレの構造（①デレ→②ツン→③デレ）の順序を守る", () => {
  for (const b of STORY_BEATS) {
    const lines = milinaLines(b);
    if (lines.length < 3) continue;
    const tsun = lines.map((l, i) => (TSUN.test(l) ? i : -1)).filter((i) => i >= 0);
    assert.ok(tsun.length > 0, `${b.id}: 3行以上あるのに②ツンがない`);
    assert.ok(!tsun.includes(0), `${b.id}: ①デレより先に②ツンが来ている`);
    assert.ok(!tsun.includes(lines.length - 1), `${b.id}: ②ツンで終わっている（③の本音が漏れていない）`);
  }
});

test("ミリナ: どのビートも②ツンで終わらない（冷たいだけの人物にしない）", () => {
  for (const b of STORY_BEATS) {
    const lines = milinaLines(b);
    if (lines.length === 0) continue;
    assert.ok(!TSUN.test(lines.at(-1)), `${b.id}: 最後の台詞が否定で終わっている → ${lines.at(-1)}`);
  }
});

// 名前を持つ人物は主人公とミリナだけ（STORY.md「登場人物」）。世界に証人が一人しかいない状態を保つ。
test("名前を持つ人物は主人公とミリナだけ", () => {
  const speakers = new Set(STORY_BEATS.flatMap((b) => (b.dialogue ?? []).map((d) => d.npc)));
  assert.deepEqual([...speakers].sort(), ["milina"], `ミリナ以外が喋っている → ${[...speakers]}`);
  const world = buildWorld(buildPlayer([], "テスト"));
  assert.deepEqual(Object.keys(world.npcs), ["milina"], "初期NPCがミリナだけではない");
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
