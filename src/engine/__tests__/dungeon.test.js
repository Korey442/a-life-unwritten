import test from "node:test";
import assert from "node:assert/strict";
import { buildWorld, buildPlayer } from "../worldState.js";
import { skillCheck, successOdds, APPROACHES, PARTIAL_BAND } from "../checks.js";
import { startDive, resolveEncounter, endDive, inNet, currentEnemy, diveProgress, DIVE } from "../dungeon.js";
import { LAYERS } from "../../data/layers.js";

// 層の開放は物語ビートが行う（flag `unlocked:<id>`）。ダンジョン単体のテストでは直接立てる。
const world = () => {
  const w = buildWorld(buildPlayer([], "テスト"));
  w.flags.push("unlocked:sns_ruins");
  return w;
};
const fixedRng = (v) => () => v; // dice = 1 + floor(v*10)

// ---- checks ----
test("skillCheck: 成功/辛勝/失敗の帯", () => {
  const p = buildPlayer([], "t"); // 全stat3, skill0
  const app = APPROACHES.force; // tain(3)+combat(0)
  // dice=10 → total=13。難度13→成功、14→辛勝(13>=14-3)、17→失敗(13<14)
  assert.equal(skillCheck(p, app, 13, fixedRng(0.99)).outcome, "success");
  assert.equal(skillCheck(p, app, 14, fixedRng(0.99)).outcome, "partial");
  assert.equal(skillCheck(p, app, 17, fixedRng(0.99)).outcome, "fail");
});

test("successOdds: 0〜100%を返し、難度が上がると下がる", () => {
  const p = buildPlayer([], "t");
  const easy = successOdds(p, APPROACHES.force, 8);
  const hard = successOdds(p, APPROACHES.force, 18);
  assert.ok(easy > hard);
  assert.ok(easy <= 100 && hard >= 0);
});

// ---- dive lifecycle ----
test("startDive: home→net、dive状態が立つ", () => {
  const { world: w, ok } = startDive(world(), "sns_ruins");
  assert.equal(ok, true);
  assert.ok(inNet(w));
  assert.equal(currentEnemy(w).name, LAYERS.sns_ruins.nodes[0].enemy.name);
  assert.ok(w.flags.includes("dived_once"));
});

test("startDive: 未開放の層には潜れない（物語より先へは進めない）", () => {
  const w0 = buildWorld(buildPlayer([], "テスト")); // 開放フラグなし
  const { world: w, ok, reason } = startDive(w0, "sns_ruins");
  assert.equal(ok, false);
  assert.equal(inNet(w), false);
  assert.ok(reason);
  // 開放済みでも、別の層はまだ閉じている
  assert.equal(startDive(world(), "core_root").ok, false);
});

test("resolveEncounter: 成功で前進、失敗は留まり体力が減る", () => {
  let { world: w } = startDive(world(), "sns_ruins");
  const hp0 = w.player.condition;
  // 高ロールで成功→前進
  let r = resolveEncounter(w, "search", fixedRng(0.99));
  assert.equal(r.result.outcome === "fail", false);
  assert.equal(diveProgress(r.world).index, 1);
  // 低ロールで失敗→留まる＆ダメージ
  const before = diveProgress(r.world).index;
  let r2 = resolveEncounter(r.world, "force", fixedRng(0.0)); // dice=1, tain3 → total4 vs 高難度→失敗
  assert.equal(r2.result.outcome, "fail");
  assert.equal(diveProgress(r2.world).index, before); // 前進しない
  assert.ok(r2.world.player.condition < hp0); // 消耗
});

test("ミリナに任せる: assistを消費し必ず成功・前進、xpなし", () => {
  let { world: w } = startDive(world(), "sns_ruins");
  const r = resolveEncounter(w, "milina", fixedRng(0.5));
  assert.equal(r.result.assist, true);
  assert.equal(r.result.outcome, "success");
  assert.equal(r.world.dive.assists, DIVE.ASSISTS - 1);
  assert.equal(diveProgress(r.world).index, 1);
});

test("全ノード突破で cleared、endDive で復旧報酬とフラグ", () => {
  let w = startDive(world(), "sns_ruins").world;
  let cleared = false;
  for (let i = 0; i < 10 && inNet(w) && !cleared; i++) {
    const r = resolveEncounter(w, "search", fixedRng(0.99)); // 常に高ロール
    w = r.world;
    cleared = !!r.result.cleared;
  }
  assert.equal(cleared, true);
  const money0 = w.money;
  const { world: home } = endDive(w, "cleared");
  assert.equal(home.location, "home");
  assert.equal(home.dive, undefined);
  assert.ok(home.flags.includes("restored:sns_ruins"));
  assert.equal(home.money, money0 + LAYERS.sns_ruins.reward.money);
});

test("endDive retreat/defeated: 気分低下・体力は5以上に戻る", () => {
  let w = startDive(world(), "sns_ruins").world;
  const mood0 = w.player.mood;
  const ret = endDive(w, "retreat").world;
  assert.ok(ret.player.mood < mood0);
  assert.equal(ret.location, "home");

  let w2 = startDive(world(), "sns_ruins").world;
  w2.player.condition = 0;
  const def = endDive(w2, "defeated").world;
  assert.ok(def.player.condition >= 5);
});
