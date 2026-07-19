// 背景＋プレイヤーとNPCを並べて表示。World State を読むだけ（書き換えは onCostume 経由）。
// ミリナのようなデジタル存在（n.digital）は、実体の立ち絵ではなく「デバイス画面に映る」表現で描く。
import Background from "./Background.jsx";
import { playerSprite, npcSprite, COSTUMES } from "../sprites.js";

// 物理的な立ち絵（人間キャラ）
function Figure({ src, label, dim }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transition: "opacity .3s", opacity: dim ? 0.7 : 1 }}>
      {src && <img src={src} alt={label} style={{ height: 400, filter: "drop-shadow(0 4px 8px rgba(0,0,0,.25))" }} />}
      <div style={{ marginTop: -6, fontSize: 12, color: "#4b4740", background: "rgba(255,255,255,.8)", padding: "1px 10px", borderRadius: 10 }}>{label}</div>
    </div>
  );
}

// デジタル存在（AI）を、スマホ/端末のディスプレイに映っている画面として描く
function DigitalFigure({ src, label, dim, offline }) {
  const H = 372, W = 176;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transition: "opacity .3s", opacity: dim ? 0.75 : 1 }}>
      <div style={{
        position: "relative", width: W, height: H, borderRadius: 22, padding: 6,
        background: "linear-gradient(160deg,#1b1f2e,#0c0e16)",
        boxShadow: "0 6px 16px rgba(0,0,0,.35), 0 0 18px rgba(96,180,220,.35)",
        border: "1px solid #2b3350",
      }}>
        {/* 画面 */}
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 16, overflow: "hidden", background: "#0a0c14" }}>
          {src && <img src={src} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 12%", filter: offline ? "grayscale(0.7) brightness(0.7)" : "none" }} />}
          {/* 走査線 */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0) 0, rgba(0,0,0,0) 2px, rgba(0,0,0,.06) 3px)" }} />
          {/* 画面の光沢・縁のグロー */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 24px rgba(120,200,240,.25)", borderRadius: 16 }} />
          {/* 上部ステータス */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", fontSize: 10, color: "#dbe6f2", background: "linear-gradient(180deg,rgba(6,8,14,.75),rgba(6,8,14,0))" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: offline ? "#c8543a" : "#5fd08a", boxShadow: offline ? "0 0 6px #c8543a" : "0 0 6px #5fd08a" }} />
            <span style={{ fontWeight: 700, letterSpacing: 1 }}>{label}</span>
            <span style={{ marginLeft: "auto", opacity: 0.85 }}>{offline ? "切断" : "接続中"}</span>
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
  // 異変でネットが機能不全＝デジタル存在は「切断」寄りの見た目に（story.anomaly が立ったら）
  const offline = !!world.story?.anomaly && world.location !== "net";
  return (
    <div style={{ position: "relative", width: "min(360px, 100%)", height: 470, borderRadius: 14, overflow: "hidden", border: "1px solid #e0dccf", background: "#cdd8e0", margin: "0 auto" }}>
      <Background hour={world.time.hour} place={world.location} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6 }}>
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
            style={{ padding: "4px 9px", fontSize: 11, borderRadius: 14, cursor: "pointer", border: "none",
              background: p.costume === v ? "rgba(107,122,90,.95)" : "rgba(255,255,255,.75)", color: p.costume === v ? "#fff" : "#4b4740" }}>{jp}</button>
        ))}
      </div>
    </div>
  );
}
