// スキル成長（DESIGN.md 5章）。行動にタグが付き、対応スキルが微増。
// スキル値は quest objective の成否判定に効く（AIプロンプトへ難易度照合材料として渡す）。
import { clamp } from "./time.js";

// スキル定義（表示名）
export const SKILL_DEFS = {
  combat: "戦闘",
  social: "社交",
  craft: "製作",
  study: "学識",
  physical: "身体",
};

export const SKILL_KEYS = Object.keys(SKILL_DEFS);

// 行動タグ → 伸びるスキル。AIが action にタグを付けて返す想定。
export const TAG_TO_SKILL = {
  combat: "combat",
  social: "social",
  craft: "craft",
  study: "study",
  physical: "physical",
};

export function initSkills() {
  return SKILL_KEYS.reduce((acc, k) => ((acc[k] = 0), acc), {});
}

// 有効なタグ配列だけ返す
export function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.filter((t) => t in TAG_TO_SKILL);
}

// タグに応じてスキルを微増（非破壊）。1タグあたり +gain（既定1）、上限100。
// 蓄積の手応え: 高いほど伸びは鈍る（対数的）。
export function applyTags(skills, tags, gain = 1) {
  const next = { ...skills };
  for (const tag of normalizeTags(tags)) {
    const key = TAG_TO_SKILL[tag];
    const cur = next[key] ?? 0;
    // 値が高いほど伸び幅を抑える（0→+gain, 高値→+約1）
    const scaled = Math.max(1, Math.round(gain * (1 - cur / 200)));
    next[key] = clamp(cur + scaled, 0, 100);
  }
  return next;
}

// スキル値をランク表記に（AIプロンプト/UI用）
export function skillRank(v) {
  if (v >= 80) return "熟練";
  if (v >= 50) return "中級";
  if (v >= 20) return "初級";
  return "未熟";
}
