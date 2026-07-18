// L1 World State — 確定事実を JSON で一元管理（決定論的）。
// UIはここを読むだけ。書き換えは必ず L2 verify 経由。
import { clamp } from "./time.js";
import { initSkills } from "./skills.js";

export const STAT_DEFS = { tain: "体力", chi: "知力", cha: "魅力", dex: "器用さ", act: "行動力" };
export const EMOTIONS = ["neutral", "happy", "angry", "sad", "shy", "surprise"];

export const SAVE_VERSION = 1;

// キャラメイク回答（effects配列）から初期プレイヤーを構築
export function buildPlayer(answers, name) {
  const stats = { tain: 3, chi: 3, cha: 3, dex: 3, act: 3 };
  const axes = { extro: 0, bold: 0 };
  (answers || []).forEach((eff) =>
    Object.entries(eff).forEach(([k, v]) => {
      if (k in stats) stats[k] = clamp(stats[k] + v, 1, 10);
      else axes[k] = clamp((axes[k] || 0) + v, -5, 5);
    })
  );
  return {
    name: name || "あなた",
    stats,
    axes,
    condition: 100,
    mood: 60,
    costume: "school",
    emotion: "neutral",
    skills: initSkills(),
  };
}

export function buildWorld(player) {
  return {
    saveVersion: SAVE_VERSION,
    time: { day: 1, hour: 7, minute: 0 },
    location: "home",
    money: 42000,
    player,
    npcs: {
      haruka: { id: "haruka", name: "遥", note: "幼馴染", affinity: 45, trust: 50, alive: true, present: true, sprite: "haruka", emotion: "happy" },
    },
    flags: [],
    quests: [], // クエスト配列（状態機械の実体）
    // L4 ペーシング用メタ
    pacing: {
      lastOfferTurn: -999, // 最後にofferした「ターン番号」
      turn: 0, // 経過ターン数
    },
    log: [],
  };
}
