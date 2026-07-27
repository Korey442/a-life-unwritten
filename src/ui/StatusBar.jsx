// 上部ステータス。時刻/所持金/体調/気分と、展開で能力・スキルを表示。World State を読むだけ。
import { STAT_DEFS } from "../engine/worldState.js";
import { SKILL_DEFS, skillRank } from "../engine/skills.js";
import { fmt } from "../engine/time.js";
import { theme, miniBtn } from "./styles.jsx";

export default function StatusBar({ world, chapter, showStats, onToggle }) {
  const p = world.player;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 17, color: theme.ink }}>{fmt(world.time)}</div>
          {chapter && <div style={{ fontSize: 11, letterSpacing: 2, color: "#8a7fb0", marginTop: 1 }}>{chapter}</div>}
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 14, color: theme.sub }}>
          <span>¥{world.money.toLocaleString()}</span><span>体調 {p.condition}</span><span>気分 {p.mood}</span>
          <button style={miniBtn} onClick={onToggle}>{showStats ? "閉じる" : "能力/スキル"}</button>
        </div>
      </div>
      {showStats && (
        <div style={{ background: "#fbf9f3", border: "1px solid #e0dccf", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
            {Object.entries(STAT_DEFS).map(([k, l]) => <span key={k} style={{ fontSize: 13, color: theme.sub }}>{l} <b style={{ color: theme.ink }}>{p.stats[k]}</b></span>)}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", borderTop: "1px dashed #e0dccf", paddingTop: 8 }}>
            {Object.entries(SKILL_DEFS).map(([k, l]) => (
              <span key={k} style={{ fontSize: 13, color: theme.sub }}>{l} <b style={{ color: theme.ink }}>{p.skills?.[k] ?? 0}</b> <span style={{ fontSize: 11, color: "#a8a291" }}>{skillRank(p.skills?.[k] ?? 0)}</span></span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
