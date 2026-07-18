// L2 Fact Verification — 整合性ガード（最重要）。
// AIが返した diff / questOps を World State と突き合わせ検証してから適用する。
// 自由型ゲームは L2 がないと必ず破綻する（死亡NPC復活・残高矛盾・ID重複・締切無視）。
import { clamp, advance } from "./time.js";
import { EMOTIONS } from "./worldState.js";
import { applyTags, SKILL_KEYS } from "./skills.js";
import {
  makeQuest, findQuest, accept as acceptQuest, decline as declineQuest, advanceQuest,
  complete as completeQuest, fail as failQuest, openQuests, STATUS,
} from "./quests.js";
import { offerPolicy } from "./pacing.js";

// 新NPCの立ち絵。実在アセット(assets/chars/npc_stranger_*.png)に割り当てる。
const NPC_SPRITE_POOL = ["stranger"];

// メインの適用関数。世界とAI応答 res を受け取り、検証済みの新世界と却下理由を返す。
export function verifyApply(world, res) {
  const w = structuredClone(world);
  const diff = res?.diff || {};
  const rejected = [];
  let offeredCount = 0;

  // --- 時間経過 ---
  w.time = advance(w.time, Number.isFinite(Number(diff.advanceMin)) ? Number(diff.advanceMin) : 30);

  // --- 所持金（残高不足は却下） ---
  if (diff.money) {
    const d = Math.round(Number(diff.money)) || 0;
    if (w.money + d < 0) rejected.push("所持金が足りず、支払いはできなかった。");
    else w.money += d;
  }

  // --- 体調・気分 ---
  if (diff.condition) w.player.condition = clamp(w.player.condition + Number(diff.condition), 0, 100);
  if (diff.mood) w.player.mood = clamp(w.player.mood + Number(diff.mood), 0, 100);

  // --- NPC好感度（不在/死亡への変化は却下） ---
  if (diff.npcAffinity) {
    for (const [id, d] of Object.entries(diff.npcAffinity)) {
      const npc = w.npcs[id];
      if (!npc || !npc.alive) rejected.push(`存在しない人物への関係変化は無効化された（${id}）。`);
      else npc.affinity = clamp(npc.affinity + Number(d), 0, 100);
    }
  }

  // --- 新NPC（ID重複は却下、衣装ローテ割当） ---
  if (res?.newNpcs) {
    for (const [id, npc] of Object.entries(res.newNpcs)) {
      if (w.npcs[id]) { rejected.push(`既存IDのNPC登場は無効化された（${id}）。`); continue; }
      const idx = Object.keys(w.npcs).length % NPC_SPRITE_POOL.length;
      w.npcs[id] = {
        id, name: npc.name || id, note: npc.note || "",
        affinity: clamp(Number(npc.affinity ?? 30), 0, 100),
        trust: clamp(Number(npc.trust ?? 20), 0, 100),
        alive: true, present: true, sprite: NPC_SPRITE_POOL[idx], emotion: "neutral",
      };
    }
  }

  // --- スキル成長（行動タグに応じて微増） ---
  if (res?.actionTags) w.player.skills = applyTags(w.player.skills, res.actionTags);

  // --- 表情 ---
  w.player.emotion = EMOTIONS.includes(res?.playerEmotion) ? res.playerEmotion : "neutral";
  if (res?.npcEmotions) {
    for (const [id, e] of Object.entries(res.npcEmotions)) {
      if (w.npcs[id] && EMOTIONS.includes(e)) w.npcs[id].emotion = e;
    }
  }

  // --- クエスト運営（questOps）を検証適用 ---
  const q = res?.questOps || {};
  offeredCount += applyOffers(w, q.offer, rejected);
  applyAdvances(w, q.advance, rejected);
  applyCompletes(w, q.complete, rejected);
  applyFails(w, q.fail, rejected);

  // --- ログ（narration＋発話） ---
  let logText = res?.narration || "（沈黙）";
  if (res?.dialogue) {
    for (const [id, line] of Object.entries(res.dialogue)) {
      const nm = w.npcs[id]?.name || id;
      logText += `\n${nm}「${line}」`;
    }
  }
  w.log = [...w.log, { ...w.time, text: logText }];

  return { world: w, rejected, offered: offeredCount };
}

// offer: L4のofferPolicyで許可された枠数だけ受理。重複タイトル・無効依頼主は安全側に処理。
function applyOffers(w, offers, rejected) {
  if (!Array.isArray(offers) || offers.length === 0) return 0;
  const policy = offerPolicy(w);
  if (!policy.allowed) {
    rejected.push(`新クエストの提示は見送られた（${policy.reasons.join("・") || "枠なし"}）。`);
    return 0;
  }
  let slots = policy.remaining;
  let count = 0;
  const openTitles = new Set(openQuests(w).map((x) => x.title));
  for (const spec of offers) {
    if (slots <= 0) { rejected.push("提示枠を超えたクエストは見送られた。"); break; }
    if (!spec || typeof spec !== "object") continue;
    // 依頼主が無効なら紐付けを外す（クエスト自体は生かす）
    let s = spec;
    if (spec.giverNpcId && !(w.npcs[spec.giverNpcId]?.alive)) {
      rejected.push(`依頼主が不明なため、クエスト「${spec.title ?? "?"}」は依頼主なしで提示された。`);
      s = { ...spec, giverNpcId: null };
    }
    const quest = makeQuest(s, w.time);
    if (openTitles.has(quest.title) || findQuest(w, quest.id)) {
      rejected.push(`重複するクエスト「${quest.title}」は無効化された。`);
      continue;
    }
    w.quests.push(quest);
    openTitles.add(quest.title);
    slots -= 1;
    count += 1;
  }
  return count;
}

function applyAdvances(w, advances, rejected) {
  if (!Array.isArray(advances)) return;
  for (const a of advances) {
    if (!a || typeof a !== "object") continue;
    const q = findQuest(w, a.questId);
    if (!q) { rejected.push(`存在しないクエストの進行は無効（${a.questId}）。`); continue; }
    if (q.status !== STATUS.ACTIVE) { rejected.push(`受注していないクエストの進行は無効（${q.title}）。`); continue; }
    const idx = w.quests.indexOf(q);
    w.quests[idx] = advanceQuest(q, a);
  }
}

function applyCompletes(w, completes, rejected) {
  if (!Array.isArray(completes)) return;
  for (const id of completes) {
    const q = findQuest(w, id);
    if (!q) { rejected.push(`存在しないクエストの達成は無効（${id}）。`); continue; }
    if (q.status !== STATUS.ACTIVE) { rejected.push(`受注中でないクエストの達成は無効（${q.title}）。`); continue; }
    const idx = w.quests.indexOf(q);
    w.quests[idx] = completeQuest(q, w.time);
    applyReward(w, q.reward, rejected);
  }
}

function applyFails(w, fails, rejected) {
  if (!Array.isArray(fails)) return;
  for (const id of fails) {
    const q = findQuest(w, id);
    if (!q) { rejected.push(`存在しないクエストの失敗指定は無効（${id}）。`); continue; }
    const idx = w.quests.indexOf(q);
    if (idx < 0) continue;
    w.quests[idx] = failQuest(q, w.time);
    w.flags = [...w.flags, `quest_failed:${q.id}`];
  }
}

// 報酬を検証済みチャネルで適用（達成時のみ）。money/affinity/skill。
function applyReward(w, reward, rejected) {
  if (!reward) return;
  if (Number.isFinite(Number(reward.money))) w.money = Math.max(0, w.money + Math.round(Number(reward.money)));
  if (reward.affinity) {
    for (const [id, d] of Object.entries(reward.affinity)) {
      const npc = w.npcs[id];
      if (npc && npc.alive) npc.affinity = clamp(npc.affinity + Number(d), 0, 100);
    }
  }
  if (reward.skill) {
    for (const [k, d] of Object.entries(reward.skill)) {
      if (SKILL_KEYS.includes(k)) w.player.skills[k] = clamp((w.player.skills[k] ?? 0) + Number(d), 0, 100);
    }
  }
}

// 受注/拒否はプレイヤー操作（UIから）。ここも状態機械を必ず経由させる。
export function playerAccept(world, questId) {
  const w = structuredClone(world);
  const q = findQuest(w, questId);
  if (!q || q.status !== STATUS.OFFERED) return { world, changed: false };
  w.quests[w.quests.indexOf(q)] = acceptQuest(q);
  return { world: w, changed: true };
}
export function playerDecline(world, questId) {
  const w = structuredClone(world);
  const q = findQuest(w, questId);
  if (!q || q.status !== STATUS.OFFERED) return { world, changed: false };
  w.quests[w.quests.indexOf(q)] = declineQuest(q, w.time);
  return { world: w, changed: true };
}
