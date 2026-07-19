// ネット層の遭遇UI。現在の敵・進行・体力を示し、アプローチ（魔法＝ネット概念）で判定に挑む。
// World State を読むだけ。操作は onApproach / onRetreat 経由（engine/dungeon が解決）。
import { APPROACHES, APPROACH_KEYS, successOdds } from "../engine/checks.js";
import { currentEnemy, diveProgress } from "../engine/dungeon.js";
import { theme, btn } from "./styles.jsx";

function effDifficulty(enemy, key) {
  let d = enemy.difficulty;
  if (enemy.weak?.includes(key)) d -= 3;
  if (enemy.resist?.includes(key)) d += 3;
  return d;
}

export default function NetPanel({ world, onApproach, onRetreat }) {
  const enemy = currentEnemy(world);
  const prog = diveProgress(world);
  const p = world.player;
  const assists = world.dive?.assists ?? 0;
  if (!enemy) return null;

  return (
    <div style={{ background: "#0e1626", border: "1px solid #24406a", borderRadius: 12, padding: 14, color: "#dbe6f2" }}>
      {/* ヘッダ：層タイトル・進行・支援 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontSize: 13, color: "#8fd0e6", letterSpacing: 1 }}>{world.dive.title}</span>
        <span style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 11 }}>
          {Array.from({ length: prog.total }, (_, i) => (
            <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < prog.index ? "#5fd08a" : i === prog.index ? "#f5c26b" : "#2a3a55" }} />
          ))}
        </span>
      </div>

      {/* 体力バー */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: "#9fb2c8" }}>体力</span>
        <div style={{ flex: 1, height: 8, background: "#1a2942", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${p.condition}%`, height: "100%", background: p.condition > 30 ? "#5fd08a" : "#e0714a", transition: "width .3s" }} />
        </div>
        <span style={{ fontSize: 11, color: "#dbe6f2", minWidth: 28, textAlign: "right" }}>{p.condition}</span>
      </div>

      {/* 敵 */}
      <div style={{ background: "#111d33", border: "1px solid #24406a", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <strong style={{ fontSize: 15, color: enemy.boss ? "#f5a6c0" : "#e8eef6" }}>{enemy.boss ? "【中枢】" : ""}{enemy.name}</strong>
          <span style={{ fontSize: 11, color: "#9fb2c8" }}>難度 {enemy.difficulty}</span>
        </div>
        <div style={{ fontSize: 12.5, color: "#9fb2c8", marginTop: 4, lineHeight: 1.6 }}>{enemy.desc}</div>
      </div>

      {/* アプローチ（魔法＝ネット概念） */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {APPROACH_KEYS.map((key) => {
          const a = APPROACHES[key];
          const d = effDifficulty(enemy, key);
          const odds = successOdds(p, a, d);
          const weak = enemy.weak?.includes(key);
          const resist = enemy.resist?.includes(key);
          return (
            <button key={key} onClick={() => onApproach(key)}
              style={{ textAlign: "left", padding: "8px 10px", borderRadius: 9, cursor: "pointer",
                border: "1px solid " + (weak ? "#5fd08a" : resist ? "#7a3a3a" : "#2a4266"),
                background: "#132140", color: "#dbe6f2" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{a.name}</span>
                <span style={{ fontSize: 11, color: odds >= 60 ? "#7fe0a0" : odds >= 35 ? "#f5c26b" : "#e0714a" }}>{odds}%</span>
              </div>
              <div style={{ fontSize: 10.5, color: "#8ba0ba", marginTop: 2 }}>{a.blurb}</div>
              <div style={{ fontSize: 10, color: "#7f93ad", marginTop: 3 }}>
                {a.stat}+{a.skill}{weak ? " ・弱点!" : resist ? " ・耐性" : ""}
              </div>
            </button>
          );
        })}
        {/* ミリナに任せる */}
        <button disabled={assists <= 0} onClick={() => onApproach("milina")}
          style={{ textAlign: "left", padding: "8px 10px", borderRadius: 9, cursor: assists > 0 ? "pointer" : "default",
            border: "1px solid #6a5fd0", background: assists > 0 ? "#1c1740" : "#171726", color: assists > 0 ? "#d9d2ff" : "#5a5a72", opacity: assists > 0 ? 1 : 0.7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>ミリナに任せる</span>
            <span style={{ fontSize: 11 }}>×{assists}</span>
          </div>
          <div style={{ fontSize: 10.5, color: assists > 0 ? "#a99afd" : "#5a5a72", marginTop: 2 }}>確実に切り抜ける（成長なし）</div>
        </button>
      </div>

      <button onClick={onRetreat}
        style={{ marginTop: 12, width: "100%", padding: "8px", fontSize: 12, borderRadius: 8, cursor: "pointer",
          border: "1px solid #3a4a66", background: "transparent", color: "#9fb2c8" }}>接続を切る（撤退）</button>
    </div>
  );
}
