// スキル判定（ネット層の遭遇を解決する芯）。能力＋スキル＋ダイス vs 難度。
// 数値をそのまま返し、UIで「12 + 3 vs 15」のように可視化する。
import { SKILL_KEYS } from "./skills.js";

// 魔法＝ネット概念。各アプローチが (能力stat, スキルskill) に対応。
export const APPROACHES = {
  search:   { key: "search",   name: "サーチ",         blurb: "解析して弱点や情報を暴く", stat: "chi",  skill: "study" },
  debug:    { key: "debug",    name: "デバッグ",       blurb: "不具合を突いて無力化する", stat: "dex",  skill: "study" },
  force:    { key: "force",    name: "フォース",       blurb: "力づくで実行・突破する",   stat: "tain", skill: "combat" },
  firewall: { key: "firewall", name: "ファイアウォール", blurb: "防御を固めて凌ぐ",       stat: "tain", skill: "craft" },
  negotiate:{ key: "negotiate",name: "ハンドシェイク",   blurb: "対話で相手を鎮める",     stat: "cha",  skill: "social" },
};
export const APPROACH_KEYS = Object.keys(APPROACHES);

// 判定の帯。difficulty 以上=成功、difficulty-PARTIAL_BAND 以上=辛勝、未満=失敗。
export const PARTIAL_BAND = 3;
const DICE_SIDES = 10;

// スキル値(0-100) → 判定ボーナス(0-10)。序盤は能力が支配的、育つほどスキルが効く。
export function skillBonus(skills, skill) {
  if (!SKILL_KEYS.includes(skill)) return 0;
  return Math.floor((skills?.[skill] ?? 0) / 10);
}

// 難度に対する成功見込みの目安（UIヒント用）。0-100%。
export function successOdds(player, approach, difficulty) {
  const s = player.stats[approach.stat] ?? 3;
  const sk = skillBonus(player.skills, approach.skill);
  const fixed = s + sk;
  // dice 1..DICE_SIDES で total>=difficulty となる確率
  let win = 0;
  for (let d = 1; d <= DICE_SIDES; d++) if (fixed + d >= difficulty) win++;
  return Math.round((win / DICE_SIDES) * 100);
}

// 判定を1回行う。rng は [0,1) を返す関数（テスト用に注入可能）。
export function skillCheck(player, approach, difficulty, rng = Math.random) {
  const s = player.stats[approach.stat] ?? 3;
  const sk = skillBonus(player.skills, approach.skill);
  const dice = 1 + Math.floor(rng() * DICE_SIDES);
  const total = s + sk + dice;
  let outcome;
  if (total >= difficulty) outcome = "success";
  else if (total >= difficulty - PARTIAL_BAND) outcome = "partial";
  else outcome = "fail";
  return { approach: approach.key, stat: approach.stat, skill: approach.skill, statVal: s, skillVal: sk, dice, total, difficulty, outcome, margin: total - difficulty };
}
