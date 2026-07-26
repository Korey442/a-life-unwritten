// L4 Direction / Pacing — 収束を作る層。
// クエスト提示のタイミング制御・放置ペナルティ・締切管理。offer乱発を防ぐ。
import { clamp } from "./time.js";
import { STATUS, openSideQuests, offeredSide, active, expiredQuests, fail } from "./quests.js";

export const PACING = {
  MAX_OPEN: 3, // 同時に抱えられる offered+active の上限
  MAX_OFFERED: 2, // 未応答(offered)の上限
  OFFER_COOLDOWN_TURNS: 2, // 前回offerから最低これだけターンを空ける
  FAIL_AFFINITY_PENALTY: 12, // 締切失敗時、依頼主の好感度低下
};

// いまAIにクエスト提示を許可してよいか。プロンプトへのヒント兼、L2のofferハードゲート。
export function offerPolicy(world) {
  const turn = world.pacing?.turn ?? 0;
  const last = world.pacing?.lastOfferTurn ?? -999;
  // 枠はサイドクエストのみで数える（メインは物語が発行するので枠を食わない）
  const open = openSideQuests(world).length;
  const off = offeredSide(world).length;

  const reasons = [];
  if (open >= PACING.MAX_OPEN) reasons.push(`抱えているクエストが上限(${PACING.MAX_OPEN})`);
  if (off >= PACING.MAX_OFFERED) reasons.push(`未応答クエストが上限(${PACING.MAX_OFFERED})`);
  if (turn - last < PACING.OFFER_COOLDOWN_TURNS) reasons.push("クールダウン中");

  const remaining = Math.max(0, Math.min(PACING.MAX_OPEN - open, PACING.MAX_OFFERED - off));
  return { allowed: reasons.length === 0 && remaining > 0, remaining, reasons };
}

// ターンを1進める（非破壊）。verify適用の前に呼ぶ。
export function tick(world) {
  return { ...world, pacing: { ...world.pacing, turn: (world.pacing?.turn ?? 0) + 1 } };
}

// offerが実際に行われたことを記録（非破壊）
export function markOffered(world) {
  return { ...world, pacing: { ...world.pacing, lastOfferTurn: world.pacing?.turn ?? 0 } };
}

// 締切超過の処理（放置の帰結 = 世界からの圧）。非破壊で {world, events} を返す。
// active/offered が締切を過ぎたら failed にし、依頼主の好感度低下＋フラグを残す（非可逆）。
export function processDeadlines(world) {
  const expired = expiredQuests(world, world.time);
  if (expired.length === 0) return { world, events: [] };

  const w = structuredClone(world);
  const events = [];
  for (const q of expired) {
    const idx = w.quests.findIndex((x) => x.id === q.id);
    if (idx < 0) continue;
    const wasActive = w.quests[idx].status === STATUS.ACTIVE;
    w.quests[idx] = fail(w.quests[idx], w.time);

    // 依頼主がいれば好感度低下（受注していた場合のみ重く）
    const giver = q.giverNpcId ? w.npcs[q.giverNpcId] : null;
    if (giver && giver.alive) {
      const pen = wasActive ? PACING.FAIL_AFFINITY_PENALTY : Math.round(PACING.FAIL_AFFINITY_PENALTY / 2);
      giver.affinity = clamp(giver.affinity - pen, 0, 100);
      giver.emotion = "sad";
    }
    // フラグとして世界に残す
    w.flags = [...w.flags, `quest_failed:${q.id}`];
    events.push({
      questId: q.id,
      title: q.title,
      giverNpcId: q.giverNpcId,
      wasActive,
      text: giver
        ? `締切を過ぎ、「${q.title}」は失敗に終わった。${giver.name}は落胆している。`
        : `締切を過ぎ、「${q.title}」は流れてしまった。`,
    });
  }
  return { world: w, events };
}

// 現在アクティブなクエスト（AIプロンプト用の軽量サマリ）
export function activeSummary(world) {
  return active(world).map((q) => ({
    id: q.id,
    title: q.title,
    progress: q.progress,
    objectives: q.objectives.map((o, i) => ({ i, text: o.text, done: o.done })),
    deadline: q.deadline,
  }));
}
