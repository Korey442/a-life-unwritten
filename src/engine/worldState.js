// L1 World State — 確定事実を JSON で一元管理（決定論的）。
// UIはここを読むだけ。書き換えは必ず L2 verify 経由。
import { clamp } from "./time.js";
import { initSkills } from "./skills.js";

export const STAT_DEFS = { tain: "体力", chi: "知力", cha: "魅力", dex: "器用さ", act: "行動力" };
export const EMOTIONS = ["neutral", "happy", "angry", "sad", "shy", "surprise"];

// v3: 物語ビート(story.beats/pending/ending)と層の開放フラグ導入で構造変更（旧セーブは破棄）
export const SAVE_VERSION = 3;

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
    // 物語の正典は STORY.md、ビートは data/story.js、進行は engine/story.js。
    // act=章 / anomaly=異変の発生 / beats=発火済みビート（非可逆） / pending=選択待ち / ending=結末
    story: { act: 1, anomaly: false, beats: [], pending: null, ending: null },
    npcs: {
      // ミリナ: 主人公のAI。デジタル存在なので digital:true（Scene で端末画面として描画）。
      milina: { id: "milina", name: "ミリナ", note: "あなたのAI。何かが違う。", affinity: 55, trust: 45, alive: true, present: true, digital: true, sprite: "milina", emotion: "neutral" },
      // 遥: 幼馴染。現実側の起点。序盤は不在（別の場所）。
      haruka: { id: "haruka", name: "遥", note: "幼馴染", affinity: 45, trust: 50, alive: true, present: false, sprite: "haruka", emotion: "happy" },
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
