// ミリナの記憶（ダイブの代償）。World State を読むだけ。
//
// 見せ方の要点（STORY.md「失われ方（3段階）」）:
// - ①細部がずれる段階では、**注記を一切出さない**。彼女は気づいていないので。
//   前に見た内容との食い違いに、プレイヤーだけが気づく。
// - ②で初めて言い淀み、③で消える。title は最後まで残る＝何を忘れたかは分かる。
import { memoryViews, lostCount, frayRatio } from "../engine/memory.js";

export default function Memories({ world }) {
  const views = memoryViews(world);
  if (!views.length) return null;
  const lost = lostCount(world);
  const ratio = frayRatio(world);

  return (
    <div style={{ background: "#fbf9f3", border: "1px solid #e0dccf", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontSize: 12, letterSpacing: 2, color: "#6a5fa0" }}>ミリナの覚えていること</span>
        {lost > 0 && <span style={{ fontSize: 10.5, color: "#a8a291" }}>{lost} / {views.length} 失われた</span>}
      </div>

      {/* 痩せ具合。数値は出さない——分かってしまうと、彼女が隠している意味が消える */}
      <div style={{ height: 3, background: "#eae5d8", borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ width: `${Math.round((1 - ratio) * 100)}%`, height: "100%", background: "#b3a9d6", transition: "width .4s" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {views.map((m) => (
          <div key={m.id} style={{ opacity: m.lost ? 0.42 : 1 }}>
            <div style={{ fontSize: 11.5, color: "#8a8474", lineHeight: 1.5 }}>{m.title}</div>
            <div style={{
              fontSize: 13, lineHeight: 1.6, marginTop: 1,
              color: m.lost ? "#b5af9e" : m.unsure ? "#8f866f" : "#3a3527",
              fontStyle: m.unsure ? "italic" : "normal",
            }}>{m.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
