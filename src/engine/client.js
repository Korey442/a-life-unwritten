// クライアント側のターン要求。/api/turn にPOSTし、失敗時はローカルのモックにフォールバック。
// これを runTurn に注入する（App側）。
import { mockAiCall } from "./mockEngine.js";

export async function aiCall(world, action) {
  try {
    const resp = await fetch("/api/turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ world, action }),
    });
    if (!resp.ok) throw new Error(`server ${resp.status}`);
    const data = await resp.json();
    if (data && data.res) return data.res;
    throw new Error("bad response");
  } catch (e) {
    // サーバ未起動やAPIキー未設定でも遊べるようモックへ
    console.warn("[aiCall] フォールバック(モック):", e.message);
    return mockAiCall(world, action);
  }
}
