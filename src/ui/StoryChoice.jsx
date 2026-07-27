// 物語の選択（終章の分岐）。世界が「選ぶまで待っている」状態を表す。
// World State の story.pending を読むだけ。確定は onChoose → engine/story.resolveStoryChoice。
import { theme } from "./styles.jsx";

export default function StoryChoice({ pending, onChoose, loading }) {
  if (!pending) return null;
  return (
    <div style={{ background: "linear-gradient(160deg,#141a2c,#0b0e18)", border: "1px solid #3a3560", borderRadius: 12, padding: 16, color: "#e6e2f5" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#a99afd", marginBottom: 6 }}>{pending.title}</div>
      <div style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 14, fontFamily: "Georgia, serif" }}>{pending.prompt}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {pending.choices.map((c) => (
          <button key={c.id} disabled={loading} onClick={() => onChoose(c.id)}
            style={{ textAlign: "left", padding: "11px 14px", borderRadius: 10, cursor: loading ? "default" : "pointer",
              border: "1px solid #4a4280", background: "#1b1740", color: "#e6e2f5", opacity: loading ? 0.6 : 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{c.label}</div>
            {c.hint && <div style={{ fontSize: 11.5, color: "#a99afd", marginTop: 3, lineHeight: 1.6 }}>{c.hint}</div>}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 10.5, color: "#7d76a8", marginTop: 12 }}>——ここで選んだことは、取り消せない。</div>
    </div>
  );
}

// 結末に到達した後の表示
export function EndingBanner({ label }) {
  return (
    <div style={{ background: "#fbf9f3", border: "1px solid #d8d3c4", borderRadius: 12, padding: "18px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 11, letterSpacing: 4, color: theme.accent, marginBottom: 8 }}>ENDING</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 22, color: theme.ink, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: theme.sub, lineHeight: 1.8 }}>物語は終わった。世界は、その結果を抱えたまま続いていく。</div>
    </div>
  );
}
