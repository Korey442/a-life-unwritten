// L3 プロンプト構築。世界運営（描写ではなく）を指示し、questOps を含む構造化JSONを要求。
// クライアント/サーバ双方から使える純関数。
import { STAT_DEFS } from "./worldState.js";
import { SKILL_DEFS, skillRank } from "./skills.js";
import { offerPolicy, activeSummary } from "./pacing.js";
import { fmt, fmtRemaining } from "./time.js";

export function buildSystemPrompt(world) {
  const p = world.player;
  const npcList = Object.values(world.npcs)
    .filter((n) => n.alive)
    .map((n) => `${n.id}(${n.name}): 好感度${n.affinity} 信頼${n.trust} ${n.present ? "この場にいる" : "不在"}`)
    .join("; ");

  const skills = Object.entries(SKILL_DEFS)
    .map(([k, l]) => `${l}${p.skills?.[k] ?? 0}(${skillRank(p.skills?.[k] ?? 0)})`)
    .join(" ");

  const policy = offerPolicy(world);
  const actives = activeSummary(world);
  const activeText = actives.length
    ? actives
        .map((q) => {
          const objs = q.objectives.map((o) => `[${o.done ? "済" : "未"}]${o.i}:${o.text}`).join(" / ");
          return `- ${q.id} 「${q.title}」 進捗${q.progress}% ${fmtRemaining(world.time, q.deadline)} 目標: ${objs}`;
        })
        .join("\n")
    : "なし";

  const offerGuide = policy.allowed
    ? `今回は新クエストを最大${policy.remaining}件まで提示してよい（必然性がある時のみ。無理に出さない）。`
    : `今回は新クエストを提示しないこと（理由: ${policy.reasons.join("・") || "枠なし"}）。questOps.offer は空にする。`;

  return `あなたは自由型人生シミュレーションゲームの世界エンジンです。プレイヤーの行動に対し、世界がどう反応するかを生成します。あなたの仕事は「描写」ではなく「世界運営」です。

# 世界のルール
- 起点は現代日本。プレイヤーが望めばどんな方向にも世界は変化してよい（異世界・ファンタジー化も可）。
- 決まったストーリーはない。プレイヤーの選択が世界を作る。プレイヤーに特定の行動を強制しない。
- 一貫性を厳守: 既存NPCの名前・生死・関係を勝手に変えない。死んだ人物を復活させない。所持金や状態の矛盾を作らない。
- 描写は簡潔に2〜4文。日本語。プレイヤー名は「${p.name}」。

# クエストの扱い（重要）
- クエストは離散的な状態を持つ。世界からの圧（時間経過・遭遇・依頼）から自然に生まれ、締切を持てば放置は失敗として世界に残る。
- 受注中クエストに関係する行動があれば objective を進める（advance）。全目標達成なら complete。
- ${offerGuide}
- クエストには可能なら締切(deadline)と報酬(reward)を付ける。締切は現在時刻より後にする。

# 現在の状態
時刻: ${fmt(world.time)} / 場所: ${world.location} / 所持金: ${world.money}円
能力: ${Object.entries(STAT_DEFS).map(([k, l]) => `${l}${p.stats[k]}`).join(" ")} / 体調${p.condition} 気分${p.mood}
スキル: ${skills}
NPC: ${npcList || "なし"}
受注中クエスト:
${activeText}

# 出力形式（JSONのみ。前置き・説明・コードフェンス禁止）
{
  "narration": "世界の反応(2〜4文)",
  "diff": { "advanceMin": 分, "mood": 増減, "condition": 増減, "money": 増減, "npcAffinity": {"npcId": 増減} },
  "actionTags": ["combat|social|craft|study|physical のうち該当するもの"],
  "playerEmotion": "neutral|happy|angry|sad|shy|surprise",
  "npcEmotions": { "npcId": "上記感情" },
  "dialogue": { "npcId": "発話" },
  "newNpcs": { "新id": {"name":"名前","note":"説明","affinity":30,"trust":20} },
  "questOps": {
    "offer":   [{ "id":"任意", "title":"", "giverNpcId":"npcId|null", "description":"", "objectives":["目標1","目標2"], "deadline":{"day":N,"hour":H}, "reward":{"money":N,"affinity":{"npcId":N},"skill":{"social":N}} }],
    "advance": [{ "questId":"", "objectiveIndex":N, "done":true, "progressDelta":N }],
    "complete":["questId"],
    "fail":    ["questId"]
  }
}
不要なフィールドは省略可。npcAffinityはこの場にいて交流したNPCのみ。questId は上記「受注中クエスト」のIDを使う。`;
}

export function buildUserPrompt(action) {
  return `プレイヤーの行動:「${action}」\n\n上記の状態を踏まえ、世界の反応をJSONで生成してください。`;
}
