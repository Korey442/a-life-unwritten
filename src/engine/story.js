// 物語進行（L4）。正典 = STORY.md、データ = data/story.js。
//
// 設計の要点:
// - メインの物語は**決定論**。章の進行・層の開放・真実の開示・結末はここが持ち、AI(L3)には書かせない。
//   AIは枝葉（日々の反応・サイドクエスト）を担当する。骨をAIに渡すと自由型は必ず破綻する。
// - ビートは条件を満たすと1件ずつ発火し、発火済みIDが world.story.beats に残る（二度は起きない＝非可逆）。
// - 世界は非破壊で更新し、クエスト操作は必ず quests.js の状態機械を経由する。
import { clamp, advance } from "./time.js";
import { EMOTIONS } from "./worldState.js";
import { STORY_BEATS, STORY_QUESTS, ACT_TITLES, ENDINGS, findBeat } from "../data/story.js";
import { unlockFlag } from "../data/layers.js";
import { makeQuest, findQuest, accept as acceptQuest, complete as completeQuest, advanceQuest, STATUS } from "./quests.js";
import { applyReward } from "./verify.js";

// ---- 参照ヘルパ ----
export const currentAct = (world) => world.story?.act ?? 1;
export const actTitle = (world) => ACT_TITLES[currentAct(world)] || "";
export const firedBeats = (world) => world.story?.beats ?? [];
export const beatFired = (world, id) => firedBeats(world).includes(id);
export const pendingChoice = (world) => world.story?.pending ?? null;
export const endingOf = (world) => (world.story?.ending ? ENDINGS[`ending:${world.story.ending}`] ?? null : null);
export const isFinished = (world) => !!world.story?.ending;

// {name} などのプレースホルダを埋める
export function fill(text, world) {
  if (typeof text !== "string") return "";
  return text.replaceAll("{name}", world.player?.name ?? "あなた");
}

// ---- 条件判定 ----
export function conditionsMet(world, when = {}) {
  const flags = world.flags || [];

  // 既定では地上（現実）でのみ発火する。潜っている最中に物語を差し込まない。
  const loc = when.location ?? "home";
  if (loc !== "any" && world.location !== loc) return false;

  if (when.act !== undefined) {
    const acts = Array.isArray(when.act) ? when.act : [when.act];
    if (!acts.includes(currentAct(world))) return false;
  }
  if (when.minTurn !== undefined && (world.pacing?.turn ?? 0) < when.minTurn) return false;
  if (when.minDay !== undefined && (world.time?.day ?? 1) < when.minDay) return false;
  if (when.beats && !when.beats.every((b) => beatFired(world, b))) return false;
  if (when.flags && !when.flags.every((f) => flags.includes(f))) return false;
  if (when.notFlags && when.notFlags.some((f) => flags.includes(f))) return false;
  return true;
}

// いま発火すべきビート（配列順＝優先順）。選択待ちの間は何も起きない。
export function nextBeat(world) {
  if (pendingChoice(world)) return null;
  return STORY_BEATS.find((b) => !beatFired(world, b.id) && conditionsMet(world, b.when)) || null;
}

// ---- 適用 ----
const addFlags = (w, list) => {
  for (const f of list || []) if (!w.flags.includes(f)) w.flags.push(f);
};

function applyNpcEffects(w, npcEff) {
  for (const [id, e] of Object.entries(npcEff || {})) {
    const npc = w.npcs[id];
    if (!npc || !npc.alive) continue;
    if (typeof e.present === "boolean") npc.present = e.present;
    if (e.emotion && EMOTIONS.includes(e.emotion)) npc.emotion = e.emotion;
    if (Number.isFinite(Number(e.affinity))) npc.affinity = clamp(npc.affinity + Number(e.affinity), 0, 100);
    if (Number.isFinite(Number(e.trust))) npc.trust = clamp(npc.trust + Number(e.trust), 0, 100);
    if (e.note) npc.note = e.note;
  }
}

// 物語が発行するクエスト。テンプレIDで一意なので重複発行しない。
function applyOfferQuest(w, key) {
  const tmpl = STORY_QUESTS[key];
  if (!tmpl || findQuest(w, tmpl.id)) return;
  const spec = { ...tmpl };
  if (tmpl.deadlineIn) {
    const d = advance(w.time, (tmpl.deadlineIn.days ?? 0) * 1440 + (tmpl.deadlineIn.hours ?? 0) * 60);
    spec.deadline = { day: d.day, hour: d.hour, minute: d.minute };
  }
  delete spec.deadlineIn;
  w.quests.push(makeQuest(spec, w.time));
}

// 物語側の進行。受注していない（拒否/未応答）クエストには手を出さない＝プレイヤーの選択は残る。
function applyAdvanceQuests(w, list) {
  for (const a of list || []) {
    const q = findQuest(w, a.id);
    if (!q || q.status !== STATUS.ACTIVE) continue;
    w.quests[w.quests.indexOf(q)] = advanceQuest(q, { objectiveIndex: a.objectiveIndex, done: true });
  }
}

function applyCompleteQuests(w, ids) {
  for (const id of ids || []) {
    const q = findQuest(w, id);
    if (!q) continue;
    // 未応答のまま結果だけ出た場合は受注扱いにして締める。拒否/失敗済みはそのまま（非可逆）。
    let target = q;
    if (q.status === STATUS.OFFERED) target = acceptQuest(q);
    if (target.status !== STATUS.ACTIVE) continue;
    w.quests[w.quests.indexOf(q)] = completeQuest(target, w.time);
    applyReward(w, q.reward, []);
  }
}

export function applyEffects(w, eff) {
  if (!eff) return;
  if (Number.isFinite(Number(eff.setAct))) w.story.act = Number(eff.setAct);
  if (typeof eff.anomaly === "boolean") w.story.anomaly = eff.anomaly;
  if (eff.unlock) addFlags(w, eff.unlock.map(unlockFlag));
  if (eff.addFlags) addFlags(w, eff.addFlags);
  if (Number.isFinite(Number(eff.mood))) w.player.mood = clamp(w.player.mood + Number(eff.mood), 0, 100);
  if (Number.isFinite(Number(eff.condition))) w.player.condition = clamp(w.player.condition + Number(eff.condition), 0, 100);
  if (Number.isFinite(Number(eff.money))) w.money = Math.max(0, w.money + Number(eff.money));
  if (eff.npc) applyNpcEffects(w, eff.npc);
  if (eff.offerQuest) applyOfferQuest(w, eff.offerQuest);
  if (eff.advanceQuest) applyAdvanceQuests(w, eff.advanceQuest);
  if (eff.completeQuest) applyCompleteQuests(w, eff.completeQuest);
  for (const f of eff.addFlags || []) if (f.startsWith("ending:")) w.story.ending = f.slice("ending:".length);
}

// ビート本文（地の文＋台詞）を組み立てる
export function beatText(world, beat) {
  let text = fill(beat.text, world);
  for (const d of beat.dialogue || []) {
    const nm = world.npcs[d.npc]?.name || d.npc;
    text += `\n${nm}「${fill(d.line, world)}」`;
  }
  return text;
}

// ビートを1件適用（非破壊）
export function applyBeat(world, beat) {
  const w = structuredClone(world);
  w.story = { ...(w.story || {}), beats: [...(w.story?.beats || []), beat.id] };
  applyEffects(w, beat.effects);

  w.log = [...w.log, { ...w.time, kind: "story", title: beat.title, text: beatText(w, beat) }];

  // 選択を持つビートは、プレイヤーが選ぶまで world を待たせる（強制はしないが、避けても通れない分岐）
  if (beat.choices?.length) {
    w.story.pending = {
      beatId: beat.id,
      title: beat.title,
      prompt: fill(beat.prompt || "——選ぶ。", w),
      choices: beat.choices.map((c) => ({ id: c.id, label: c.label, hint: fill(c.hint || "", w) })),
    };
  }
  return { world: w, beat };
}

// 物語を進める。既定は1ターン1ビート（詰め込まない）。
// 層の復旧直後など「その場で反応が要る」場面は max を上げて呼ぶ。
export function progressStory(world, { max = 1 } = {}) {
  let w = world;
  const fired = [];
  for (let i = 0; i < max; i++) {
    const beat = nextBeat(w);
    if (!beat) break;
    const r = applyBeat(w, beat);
    w = r.world;
    fired.push(beat);
    if (w.story?.pending) break; // 選択待ちで停止
  }
  return { world: w, fired };
}

// 選択の確定（非可逆）。UIから呼ぶ。
export function resolveStoryChoice(world, choiceId) {
  const pending = pendingChoice(world);
  if (!pending) return { world, ok: false };
  const beat = findBeat(pending.beatId);
  const choice = beat?.choices?.find((c) => c.id === choiceId);
  if (!choice) return { world, ok: false };

  const w = structuredClone(world);
  w.story.pending = null;
  applyEffects(w, choice.effects);
  addFlags(w, [`choice:${beat.id}:${choice.id}`]);
  w.log = [...w.log, { ...w.time, kind: "story", title: choice.label, text: fill(choice.text, w) }];
  return { world: w, ok: true, choice };
}
