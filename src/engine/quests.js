// クエスト状態機械（DESIGN.md 4章）。「チャット→ゲーム」への転換点。
// クエストは離散的な状態を持つ構造体。放置は締切で failed として世界に残る（非可逆性）。
import { clamp, isPast } from "./time.js";

// 状態: offered→(accept)→active→completed / (decline)→declined / (deadline)→failed
export const STATUS = {
  OFFERED: "offered",
  ACTIVE: "active",
  COMPLETED: "completed",
  FAILED: "failed",
  DECLINED: "declined",
};

// 進行中とみなす状態（提示中＋受注中）。offer上限や締切処理の対象。
export const OPEN_STATUSES = [STATUS.OFFERED, STATUS.ACTIVE];

let _seq = 0;
// テスト決定性のためにシード可能
export function resetIdSeq(n = 0) {
  _seq = n;
}
function genId(time) {
  _seq += 1;
  return `q_${time.day}_${time.hour}${String(time.minute).padStart(2, "0")}_${_seq}`;
}

// AIのoffer(status除く)から offered クエストを生成。欠損は安全側に補完。
export function makeQuest(spec, time) {
  const objectives = Array.isArray(spec.objectives) && spec.objectives.length
    ? spec.objectives.map((o) =>
        typeof o === "string"
          ? { text: o, done: false }
          : { text: String(o.text ?? ""), done: !!o.done }
      )
    : [{ text: String(spec.description ?? spec.title ?? "目的を果たす"), done: false }];

  return {
    id: spec.id && typeof spec.id === "string" ? spec.id : genId(time),
    title: String(spec.title ?? "名もなき依頼"),
    giverNpcId: spec.giverNpcId ?? null,
    description: String(spec.description ?? ""),
    objectives,
    status: STATUS.OFFERED,
    deadline: normalizeDeadline(spec.deadline),
    progress: 0,
    reward: normalizeReward(spec.reward),
    // main:true = 物語（data/story.js）が発行する背骨のクエスト。L4の提示枠には数えない。
    // AI(L3)の offer からは verify 側で必ず false に落とす（枠の迂回を防ぐ）。
    main: !!spec.main,
    tags: Array.isArray(spec.tags) ? spec.tags.slice(0, 4) : [],
    createdAt: { ...time },
    resolvedAt: null,
  };
}

function normalizeDeadline(d) {
  if (!d || typeof d !== "object") return null;
  const day = Number(d.day);
  const hour = Number(d.hour);
  if (!Number.isFinite(day) || !Number.isFinite(hour)) return null;
  return { day, hour: clamp(hour, 0, 23), minute: Number.isFinite(Number(d.minute)) ? clamp(Number(d.minute), 0, 59) : 0 };
}

function normalizeReward(r) {
  if (!r || typeof r !== "object") return {};
  const out = {};
  if (Number.isFinite(Number(r.money))) out.money = Math.round(Number(r.money));
  if (r.affinity && typeof r.affinity === "object") {
    out.affinity = {};
    for (const [k, v] of Object.entries(r.affinity)) if (Number.isFinite(Number(v))) out.affinity[k] = Number(v);
  }
  if (r.skill && typeof r.skill === "object") {
    out.skill = {};
    for (const [k, v] of Object.entries(r.skill)) if (Number.isFinite(Number(v))) out.skill[k] = Number(v);
  }
  if (r.item && typeof r.item === "string") out.item = r.item;
  return out;
}

// ---- 参照ヘルパ ----
export const byStatus = (world, status) => (world.quests || []).filter((q) => q.status === status);
export const offered = (world) => byStatus(world, STATUS.OFFERED);
export const active = (world) => byStatus(world, STATUS.ACTIVE);
export const openQuests = (world) => (world.quests || []).filter((q) => OPEN_STATUSES.includes(q.status));
// 提示上限の対象（メインクエストは物語の背骨なので枠外）
export const openSideQuests = (world) => openQuests(world).filter((q) => !q.main);
export const offeredSide = (world) => offered(world).filter((q) => !q.main);
export const findQuest = (world, id) => (world.quests || []).find((q) => q.id === id) || null;

export function allObjectivesDone(q) {
  return q.objectives.length > 0 && q.objectives.every((o) => o.done);
}

// ---- 遷移（非破壊: 対象クエストの新オブジェクトを返す）----
export function accept(q) {
  if (q.status !== STATUS.OFFERED) return q;
  return { ...q, status: STATUS.ACTIVE };
}
export function decline(q, time) {
  if (q.status !== STATUS.OFFERED) return q;
  return { ...q, status: STATUS.DECLINED, resolvedAt: time ? { ...time } : null };
}
export function complete(q, time) {
  if (q.status !== STATUS.ACTIVE) return q;
  return {
    ...q,
    status: STATUS.COMPLETED,
    progress: 100,
    objectives: q.objectives.map((o) => ({ ...o, done: true })),
    resolvedAt: time ? { ...time } : null,
  };
}
export function fail(q, time) {
  if (!OPEN_STATUSES.includes(q.status)) return q;
  return { ...q, status: STATUS.FAILED, resolvedAt: time ? { ...time } : null };
}

// objective 進行を適用（非破壊）。objectiveIndex を done に、progress を再計算。
export function advanceQuest(q, { objectiveIndex, done, progressDelta } = {}) {
  if (q.status !== STATUS.ACTIVE) return q;
  let objectives = q.objectives;
  if (Number.isInteger(objectiveIndex) && objectiveIndex >= 0 && objectiveIndex < objectives.length) {
    objectives = objectives.map((o, i) => (i === objectiveIndex ? { ...o, done: done !== false } : o));
  }
  // progress: objective達成率 と progressDelta の大きい方を採用（後退させない）
  const byObj = Math.round((objectives.filter((o) => o.done).length / objectives.length) * 100);
  let progress = q.progress;
  if (Number.isFinite(Number(progressDelta))) progress = clamp(progress + Number(progressDelta), 0, 100);
  progress = clamp(Math.max(progress, byObj), 0, 100);
  return { ...q, objectives, progress };
}

// 締切超過している active/offered を抽出（L4で処理）
export function expiredQuests(world, now) {
  return openQuests(world).filter((q) => isPast(now, q.deadline));
}
