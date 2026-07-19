// 行動入力。クイック行動＋自由入力。act(text) を呼ぶだけ。
import { useState } from "react";
import { theme, inp, btn, quick } from "./styles.jsx";

const QUICK = ["働く", "食事をとる", "ミリナに話しかける", "運動する", "休む"];

export default function ActionInput({ onAct, loading }) {
  const [input, setInput] = useState("");
  const send = (text) => {
    if (loading || !text.trim()) return;
    setInput("");
    onAct(text);
  };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
        {QUICK.map((q) => <button key={q} style={{ ...quick, opacity: loading ? 0.5 : 1 }} disabled={loading} onClick={() => send(q)}>{q}</button>)}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)}
          disabled={loading} placeholder="自由に行動を書く" style={{ ...inp, marginBottom: 0, flex: 1, opacity: loading ? 0.6 : 1 }} />
        <button style={{ ...btn(theme.accent), opacity: loading ? 0.5 : 1 }} disabled={loading} onClick={() => send(input)}>{loading ? "…" : "行動"}</button>
      </div>
    </div>
  );
}
