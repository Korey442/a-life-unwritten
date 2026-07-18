// 時刻連動の背景（参考実装を踏襲、SVGドット風）。
function timeOfDay(h) { if (h < 6 || h >= 20) return "night"; if (h < 11) return "morning"; if (h < 16) return "noon"; return "evening"; }
const TIME_PAL = {
  morning: { s1: "#bcd4e6", s2: "#e8dcc0", sun: "#f5e6a8", g: "#8a9a7a" },
  noon: { s1: "#7fb0d8", s2: "#bcd9ee", sun: "#fdf3c0", g: "#7f956a" },
  evening: { s1: "#e89a5a", s2: "#c9607a", sun: "#f5c26b", g: "#5a5050" },
  night: { s1: "#2a2a4a", s2: "#3d3d5c", sun: "#e8e8f0", g: "#2f3040" },
};

export default function Background({ hour, place }) {
  const tod = timeOfDay(hour), pal = TIME_PAL[tod], night = tod === "night";
  const W = 480, H = 320;
  const stars = night ? Array.from({ length: 24 }, (_, i) => ({ x: (i * 61) % W, y: (i * 33) % (H * 0.5), s: (i % 3) * 0.5 + 1 })) : [];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" style={{ position: "absolute", inset: 0 }}>
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={pal.s1} /><stop offset="100%" stopColor={pal.s2} /></linearGradient></defs>
      <rect x="0" y="0" width={W} height={H} fill="url(#sky)" />
      {stars.map((s, i) => <rect key={i} x={s.x} y={s.y} width={s.s} height={s.s} fill="#f0f0ff" opacity="0.9" />)}
      <circle cx={tod === "evening" ? W * 0.72 : W * 0.5} cy={night ? 52 : 66} r="24" fill={pal.sun} opacity="0.9" />
      <rect x="0" y={H * 0.78} width={W} height={H * 0.22} fill={pal.g} />
      {place === "home" && <g>
        <rect x={W * 0.1} y={H * 0.38} width={W * 0.8} height={H * 0.4} fill={night ? "#3a3548" : "#cdbfa2"} />
        <rect x={W * 0.5 - 3} y={H * 0.38} width="6" height={H * 0.4} fill="#8a7d5f" />
      </g>}
    </svg>
  );
}
