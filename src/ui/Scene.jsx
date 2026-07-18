// 背景＋プレイヤーとNPCを並べて表示。World State を読むだけ（書き換えは onCostume 経由）。
import Background from "./Background.jsx";
import { playerSprite, npcSprite, COSTUMES } from "../sprites.js";

function Figure({ src, label, dim }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transition: "opacity .3s", opacity: dim ? 0.7 : 1 }}>
      {src && <img src={src} alt={label} style={{ height: 400, filter: "drop-shadow(0 4px 8px rgba(0,0,0,.25))" }} />}
      <div style={{ marginTop: -6, fontSize: 12, color: "#4b4740", background: "rgba(255,255,255,.8)", padding: "1px 10px", borderRadius: 10 }}>{label}</div>
    </div>
  );
}

export default function Scene({ world, loading, onCostume }) {
  const p = world.player;
  const presentNpcs = Object.values(world.npcs).filter((n) => n.alive && n.present);
  return (
    <div style={{ position: "relative", width: "min(360px, 100%)", height: 470, borderRadius: 14, overflow: "hidden", border: "1px solid #e0dccf", background: "#cdd8e0", margin: "0 auto" }}>
      <Background hour={world.time.hour} place={world.location} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4 }}>
        <Figure src={playerSprite(p)} label={p.name} dim={loading} />
        {presentNpcs.slice(0, 2).map((n) => (
          <Figure key={n.id} src={npcSprite(n)} label={n.name} dim={loading} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 8, left: 8, right: 8, display: "flex", gap: 5, flexWrap: "wrap" }}>
        {COSTUMES.map(([v, jp]) => (
          <button key={v} onClick={() => onCostume(v)}
            style={{ padding: "4px 9px", fontSize: 11, borderRadius: 14, cursor: "pointer", border: "none",
              background: p.costume === v ? "rgba(107,122,90,.95)" : "rgba(255,255,255,.75)", color: p.costume === v ? "#fff" : "#4b4740" }}>{jp}</button>
        ))}
      </div>
    </div>
  );
}
