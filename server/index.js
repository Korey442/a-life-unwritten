// 開発用 APIサーバ。POST /api/turn を受け、L3で世界の反応を生成して返す。
// ANTHROPIC_API_KEY があれば公式SDK、無ければ決定論モックにフォールバック。
// Vite dev は /api を localhost:PORT にプロキシする（vite.config.js 参照）。
import http from "node:http";
import { callAnthropic } from "../src/engine/aiEngine.js";
import { mockAiCall } from "../src/engine/mockEngine.js";

const PORT = process.env.API_PORT || 8787;
const HAS_KEY = !!process.env.ANTHROPIC_API_KEY;

function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return json(res, 204, {});
  if (req.method === "GET" && req.url === "/api/health") {
    return json(res, 200, { ok: true, mode: HAS_KEY ? "anthropic" : "mock" });
  }
  if (req.method === "POST" && req.url === "/api/turn") {
    try {
      const { world, action } = await readBody(req);
      if (!world || typeof action !== "string") return json(res, 400, { error: "world と action が必要です" });
      let out;
      if (HAS_KEY) {
        try {
          out = await callAnthropic(world, action);
        } catch (e) {
          console.error("[anthropic] 失敗、モックにフォールバック:", e.message);
          out = mockAiCall(world, action);
        }
      } else {
        out = mockAiCall(world, action);
      }
      return json(res, 200, { res: out, mode: HAS_KEY ? "anthropic" : "mock" });
    } catch (e) {
      console.error(e);
      return json(res, 500, { error: "生成に失敗しました" });
    }
  }
  json(res, 404, { error: "not found" });
});

server.listen(PORT, () => {
  console.log(`[A Life, Unwritten] API on http://localhost:${PORT}  mode=${HAS_KEY ? "anthropic" : "mock"}`);
});
