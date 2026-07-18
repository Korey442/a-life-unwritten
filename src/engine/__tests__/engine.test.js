import test from "node:test";
import assert from "node:assert/strict";

import { buildWorld, buildPlayer } from "../worldState.js";
import { runTurn } from "../turn.js";
import { verifyApply, playerAccept, playerDecline } from "../verify.js";
import { processDeadlines, offerPolicy, tick, markOffered, PACING } from "../pacing.js";
import * as Q from "../quests.js";
import { applyTags } from "../skills.js";

function freshWorld() {
  Q.resetIdSeq(0);
  return buildWorld(buildPlayer([], "テスト"));
}

// スクリプト化した aiCall（毎ターン一段ずつ返す）
function scriptedAI(steps) {
  let i = 0;
  return async () => steps[Math.min(i++, steps.length - 1)];
}

// ---------- quests.js: 状態機械 ----------
test("makeQuest は欠損を安全側に補完する", () => {
  const q = Q.makeQuest({ title: "薬草採取" }, { day: 1, hour: 9, minute: 0 });
  assert.equal(q.status, Q.STATUS.OFFERED);
  assert.equal(q.progress, 0);
  assert.ok(q.objectives.length >= 1);
  assert.equal(q.deadline, null);
});

test("遷移: offered→accept→active、offered→decline→declined", () => {
  const q = Q.makeQuest({ title: "T" }, { day: 1, hour: 9, minute: 0 });
  assert.equal(Q.accept(q).status, Q.STATUS.ACTIVE);
  assert.equal(Q.decline(q).status, Q.STATUS.DECLINED);
  // active でない complete は不許可
  assert.equal(Q.complete(q).status, Q.STATUS.OFFERED);
});

test("advanceQuest は objective 達成率から progress を再計算し後退しない", () => {
  let q = Q.accept(Q.makeQuest({ title: "T", objectives: ["a", "b"] }, { day: 1, hour: 9, minute: 0 }));
  q = Q.advanceQuest(q, { objectiveIndex: 0, done: true });
  assert.equal(q.progress, 50);
  q = Q.advanceQuest(q, { progressDelta: -80 }); // 後退させない（objective由来50を維持）
  assert.equal(q.progress, 50);
  q = Q.advanceQuest(q, { objectiveIndex: 1, done: true });
  assert.ok(Q.allObjectivesDone(q));
  assert.equal(q.progress, 100);
});

// ---------- verify.js: L2整合性ガード ----------
test("残高不足の支払いは却下される", () => {
  const w = freshWorld();
  const { world, rejected } = verifyApply(w, { diff: { money: -999999 } });
  assert.equal(world.money, w.money); // 変化なし
  assert.ok(rejected.some((r) => r.includes("所持金")));
});

test("存在しない/死亡NPCへの好感度変化は却下される", () => {
  const w = freshWorld();
  const { rejected } = verifyApply(w, { diff: { npcAffinity: { ghost: 10 } } });
  assert.ok(rejected.some((r) => r.includes("ghost")));
});

test("ID重複の新NPCは却下される", () => {
  const w = freshWorld();
  const { world, rejected } = verifyApply(w, { newNpcs: { haruka: { name: "偽" } } });
  assert.equal(world.npcs.haruka.name, "遥");
  assert.ok(rejected.some((r) => r.includes("haruka")));
});

test("受注していないクエストの advance は無効", () => {
  let w = freshWorld();
  ({ world: w } = verifyApply(w, { questOps: { offer: [{ title: "散歩", objectives: ["歩く"] }] } }));
  const qid = Q.offered(w)[0].id;
  const { rejected } = verifyApply(w, { questOps: { advance: [{ questId: qid, objectiveIndex: 0, done: true }] } });
  assert.ok(rejected.some((r) => r.includes("受注していない")));
});

test("達成で報酬（money/affinity/skill）が検証済みチャネルで適用される", () => {
  let w = freshWorld();
  ({ world: w } = verifyApply(w, {
    questOps: { offer: [{ title: "遥の手伝い", giverNpcId: "haruka", objectives: ["手伝う"], reward: { money: 5000, affinity: { haruka: 10 }, skill: { social: 5 } } }] },
  }));
  const q = Q.offered(w)[0];
  ({ world: w } = playerAccept(w, q.id));
  const beforeMoney = w.money, beforeAff = w.npcs.haruka.affinity;
  ({ world: w } = verifyApply(w, { questOps: { complete: [q.id] } }));
  assert.equal(Q.findQuest(w, q.id).status, Q.STATUS.COMPLETED);
  assert.equal(w.money, beforeMoney + 5000);
  assert.equal(w.npcs.haruka.affinity, beforeAff + 10);
  assert.equal(w.player.skills.social, 5);
});

// ---------- pacing.js: L4 提示制御・締切 ----------
test("offerPolicy: クールダウンと同時上限を守る", () => {
  let w = freshWorld();
  w = tick(w); // turn=1
  assert.equal(offerPolicy(w).allowed, true);
  w = markOffered(w); // lastOfferTurn=1
  w = tick(w); // turn=2
  assert.equal(offerPolicy(w).allowed, false); // クールダウン中
  w = tick(w); // turn=3 (2ターン経過)
  assert.equal(offerPolicy(w).allowed, true);
});

test("offer はMAX_OFFEREDを超えて受理しない", () => {
  let w = freshWorld();
  w = tick(w);
  const many = Array.from({ length: 5 }, (_, i) => ({ title: `Q${i}`, objectives: ["x"] }));
  const { world, offered } = verifyApply(w, { questOps: { offer: many } });
  assert.equal(offered, PACING.MAX_OFFERED);
  assert.equal(Q.offered(world).length, PACING.MAX_OFFERED);
});

test("processDeadlines: 締切超過のactiveはfailed、依頼主の好感度が下がりフラグが残る", () => {
  let w = freshWorld();
  // 過去締切のactiveクエストを直接構築
  const q = Q.accept(Q.makeQuest({ title: "急ぎの依頼", giverNpcId: "haruka", deadline: { day: 1, hour: 6 } }, { day: 1, hour: 5 }));
  w.quests.push(q);
  w.time = { day: 1, hour: 8, minute: 0 }; // 締切(6時)を過ぎている
  const affBefore = w.npcs.haruka.affinity;
  const { world, events } = processDeadlines(w);
  assert.equal(Q.findQuest(world, q.id).status, Q.STATUS.FAILED);
  assert.equal(world.npcs.haruka.affinity, affBefore - PACING.FAIL_AFFINITY_PENALTY);
  assert.ok(world.flags.includes(`quest_failed:${q.id}`));
  assert.equal(events.length, 1);
});

// ---------- skills.js ----------
test("applyTags は有効タグのみ増やし、高値ほど伸びが鈍る", () => {
  let s = applyTags({ social: 0, combat: 0, craft: 0, study: 0, physical: 0 }, ["social", "invalid"]);
  assert.equal(s.social, 1);
  assert.equal(s.combat, 0);
});

// ---------- turn.js: 統合ライフサイクル ----------
test("統合: 発生→受注→進行→達成", async () => {
  let w = freshWorld();
  const ai = scriptedAI([
    { narration: "遥が頼み事をしてきた。", questOps: { offer: [{ title: "買い出し", giverNpcId: "haruka", objectives: ["店へ行く", "品を買う"], reward: { money: 1000 } }] } },
    { narration: "店に着いた。", actionTags: ["physical"] },
  ]);
  ({ world: w } = await runTurn(w, "遥に用件を聞く", ai));
  const q = Q.offered(w)[0];
  assert.ok(q, "クエストが提示される");

  ({ world: w } = playerAccept(w, q.id));
  assert.equal(Q.findQuest(w, q.id).status, Q.STATUS.ACTIVE);

  // 進行→達成をAIが返すターン
  const ai2 = scriptedAI([
    { narration: "買い物を終えた。", questOps: { advance: [{ questId: q.id, objectiveIndex: 0, done: true }, { questId: q.id, objectiveIndex: 1, done: true }], complete: [q.id] } },
  ]);
  const before = w.money;
  ({ world: w } = await runTurn(w, "買い物を済ませる", ai2));
  assert.equal(Q.findQuest(w, q.id).status, Q.STATUS.COMPLETED);
  assert.equal(w.money, before + 1000);
});

test("統合: 放置→締切→失敗（世界からの圧が残る）", async () => {
  let w = freshWorld();
  const ai = scriptedAI([
    { narration: "締切付きの依頼。", diff: { advanceMin: 0 }, questOps: { offer: [{ title: "時限依頼", giverNpcId: "haruka", objectives: ["やる"], deadline: { day: 1, hour: 8 } }] } },
  ]);
  ({ world: w } = await runTurn(w, "話を聞く", ai));
  const q = Q.offered(w)[0];
  ({ world: w } = playerAccept(w, q.id));

  // 何もせず時間だけ大きく進める行動（締切8時を超える）
  const idle = scriptedAI([{ narration: "昼寝した。", diff: { advanceMin: 300 } }]);
  const res = await runTurn(w, "昼寝する", idle);
  w = res.world;
  assert.equal(Q.findQuest(w, q.id).status, Q.STATUS.FAILED);
  assert.equal(res.deadlineEvents.length, 1);
  assert.ok(w.flags.some((f) => f.startsWith("quest_failed:")));
});

test("playerDecline は offered を declined にする", () => {
  let w = freshWorld();
  ({ world: w } = verifyApply(tick(w), { questOps: { offer: [{ title: "断る依頼" }] } }));
  const q = Q.offered(w)[0];
  ({ world: w } = playerDecline(w, q.id));
  assert.equal(Q.findQuest(w, q.id).status, Q.STATUS.DECLINED);
});
