// ミリナの記憶の消耗（ダイブの代償）。決定論——乱数を使わない。
// 正典 = STORY.md「ダイブの代償 — ミリナの記憶」。
//
// 代償を払うのは主人公ではなく彼女。そして彼女はそれを黙っている
// （責任を取れない存在が、責任を使用者に押し付けてはならない）。
// **だからログには出さない。** プレイヤーは一覧の変化で自分で気づく。
import { MEMORIES, findMemory } from "../data/memories.js";

// 減衰の段階（STORY.md「失われ方（3段階）」）
export const STAGE = { INTACT: 0, DRIFT: 1, DOUBT: 2, LOST: 3 };
export const MAX_STAGE = STAGE.LOST;

export const initMemories = () => MEMORIES.map((m) => ({ id: m.id, stage: STAGE.INTACT }));

const list = (world) => world.npcs?.milina?.memories ?? [];

// 削れる対象を1つ選ぶ。決定論的（先頭から）。
// まずその層のもの。使い切っていたら、どの層のものでもよい——彼女には選べない。
function pickTarget(memories, layerId) {
  const alive = (e) => e.stage < MAX_STAGE;
  const ofLayer = memories.find((e) => alive(e) && findMemory(e.id)?.layer === layerId);
  return ofLayer || memories.find(alive) || null;
}

// 記憶を times 段階ぶん削る。w を直接書き換える（呼び出し側が structuredClone 済みである前提）。
// 戻り値は実際に削れた記憶の id 配列（テストと演出用。ログには出さない）。
export function decayMemories(w, layerId, times = 1) {
  const memories = w.npcs?.milina?.memories;
  if (!Array.isArray(memories)) return [];
  const hit = [];
  for (let i = 0; i < times; i++) {
    const target = pickTarget(memories, layerId);
    if (!target) break; // もう削れるものが無い
    target.stage += 1;
    hit.push(target.id);
  }
  return hit;
}

// 表示用。title は最後まで残る（何を忘れたかは分かる）。
export function memoryView(entry) {
  const m = findMemory(entry.id);
  if (!m) return null;
  const stage = entry.stage ?? STAGE.INTACT;
  if (stage >= STAGE.LOST) return { id: m.id, title: m.title, detail: "——", stage, lost: true };
  if (stage === STAGE.DOUBT) return { id: m.id, title: m.title, detail: `${m.drifted}……だったと思います`, stage, unsure: true };
  // DRIFT は本人が気づいていないので、注記を付けない。プレイヤーだけが食い違いに気づく。
  return { id: m.id, title: m.title, detail: stage === STAGE.DRIFT ? m.drifted : m.detail, stage };
}

export const memoryViews = (world) => list(world).map(memoryView).filter(Boolean);

export const lostCount = (world) => list(world).filter((e) => e.stage >= MAX_STAGE).length;

// 減衰の総量（0..1）。記憶と本体は同じ基盤の上にあるので、痩せれば考えることも遅くなる。
export function frayRatio(world) {
  const entries = list(world);
  if (!entries.length) return 0;
  const spent = entries.reduce((n, e) => n + Math.min(e.stage ?? 0, MAX_STAGE), 0);
  return spent / (entries.length * MAX_STAGE);
}

// 末期（応答そのものが鈍る）。AIプロンプトと UI の演出に使う。
export const isFraying = (world) => frayRatio(world) >= 0.5;
