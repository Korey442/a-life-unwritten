// L3 Narrative / World Ops — Anthropic 公式SDK経由の世界運営。サーバ側で実行する。
// 差し替え境界はこの callAnthropic()。ブラウザにキーを置かない。
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt } from "./prompt.js";

// 毎ターン生成は速度重視。重要局面のみ上位モデルに切替可（DESIGN.md 8章）。
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

let _client = null;
function client(apiKey) {
  if (!_client) _client = new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY });
  return _client;
}

// コードフェンスや前置きが混じっても JSON 本体を取り出す
function extractJson(text) {
  let t = String(text).replace(/```json|```/g, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

// world+action から構造化応答を得る。パース失敗は最大 retries 回リトライ。
export async function callAnthropic(world, action, { apiKey, model = DEFAULT_MODEL, retries = 2 } = {}) {
  const system = buildSystemPrompt(world);
  const user = buildUserPrompt(action);
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const msg = await client(apiKey).messages.create({
        model,
        max_tokens: 1200,
        system,
        messages: [{ role: "user", content: user }],
      });
      const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      return extractJson(text);
    } catch (e) {
      lastErr = e;
      // パース失敗ならもう一度。APIエラー(認証等)は即座に投げる。
      if (e instanceof SyntaxError) continue;
      throw e;
    }
  }
  throw lastErr;
}
