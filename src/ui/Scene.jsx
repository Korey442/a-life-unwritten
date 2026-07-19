// 背景＋プレイヤーとNPCを並べて表示。親（.stage）の高さいっぱいに広がり、立ち絵は高さ比で伸縮。
// ミリナのようなデジタル存在（n.digital）は端末画面として描く。World State を読むだけ。
import Background from "./Background.jsx";
import { playerSprite, npcSprite, COSTUMES } from "../sprites.js";

// 物理的な立ち絵（人間キャラ）
function Figure({ src, label, dim }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", transition: "opacity .3s", opacity: dim ? 0.7 : 1 }}>
      {src && <img src={src} alt={label} style={{ height: "80%", maxWidth: "46%", objectFit: "contain", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.25))" }} />}
      <div style={{ marginTop: -6, fontSize: 12, color: "#4b4740", background: "rgba(255,255,255,.8)", padding: "1px 10px", borderRadius: 10 }}>{label}</div>
    </div>
  );
}

// デジタル存在（AI）を、スマホ/端末のディスプレイに映っている画面として描く
function DigitalFigure({ src, label, dim, offline }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", transition: "opacity .3s", opacity: dim ? 0.75 : 1 }}>
      <div style={{
        position: "relative", height: "70%", aspectRatio: "176 / 356", maxWidth: "42%", borderRadius: 20, padding: 5,
        background: "linear-gradient(160deg,#1b1f2e,#0c0e16)",
        boxShadow: "0 6px 16px rgba(0,0,0,.35), 0 0 18px rgba(96,180,220,.35)", border: "1px solid #2b3350",
      }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 16, overflow: "hidden", background: "#0a0c14" }}>
          {src && <img src={src} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 12%", filter: offline ? "grayscale(0.7) brightness(0.7)" : "none" }} />}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0) 0, rgba(0,0,0,0) 2px, rgba(0,0,0,.06) 3px)" }} />
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 24px rgba(120,200,240,.25)", borderRadius: 16 }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", gap: 4, padding: "4px 7px", fontSize: 9.5, color: "#dbe6f2", whiteSpace: "nowrap", background: "linear-gradient(180deg,rgba(6,8,14,.8),rgba(6,8,14,0))" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: offline ? "#c8543a" : "#5fd08a", boxShadow: offline ? "0 0 6px #c8543a" : "0 0 6px #5fd08a" }} />
            <span style={{ opacity: 0.9, letterSpacing: 1 }}>{offline ? "切断" : "接続中"}</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 4, fontSize: 12, color: "#4b4740", background: "rgba(255,255,255,.8)", padding: "1px 10px", borderRadius: 10 }}>◇ {label}</div>
    </div>
  );
}

export default function Scene({ world, loading, onCostume }) {
  const p = world.player;
  const presentNpcs = Object.values(world.npcs).filter((n) => n.alive && n.present);
  const offline = !!world.story?.anomaly && world.location !== "net";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 14, overflow: "hidden", border: "1px solid #e0dccf", background: "#cdd8e0" }}>
      <Background hour={world.time.hour} place={world.location} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, padding: "0 6px 6px" }}>
        <Figure src={playerSprite(p)} label={p.name} dim={loading} />
        {presentNpcs.slice(0, 2).map((n) =>
          n.digital
            ? <DigitalFigure key={n.id} src={npcSprite(n)} label={n.name} dim={loading} offline={offline} />
            : <Figure key={n.id} src={npcSprite(n)} label={n.name} dim={loading} />
        )}
      </div>
      <div style={{ position: "absolute", top: 8, left: 8, right: 8, display: "flex", gap: 5, flexWrap: "wrap" }}>
        {COSTUMES.map(([v, jp]) => (
          <button key={v} onClick={() => onCostume(v)}
            style={{ padding: "3px 8px", fontSize: 11, borderRadius: 14, cursor: "pointer", border: "none",
              background: p.costume === v ? "rgba(107,122,90,.95)" : "rgba(255,255,255,.75)", color: p.costume === v ? "#fff" : "#4b4740" }}>{jp}</button>
        ))}
      </div>
    </div>
  );
}
