import React, { useState, useRef, useEffect } from "react";
// CHAR_DATA は下部（統合時に注入）。{ costumes:{[cos]:{[emo]:b64}}, npcs:{[npcId]:{[emo]:b64}} }

const STAT_DEFS = { tain: "体力", chi: "知力", cha: "魅力", dex: "器用さ", act: "行動力" };

const CREATION_QUESTIONS = [
  { text: "朝、目が覚めた。今日が自由に使える一日なら、まず何をしたい？", options: [
    { label: "外に出て人に会う", effects: { cha: 2, act: 1, extro: 2 } },
    { label: "家で調べ物や作業", effects: { chi: 2, extro: -2 } },
    { label: "体を動かしに行く", effects: { tain: 2, act: 2 } },
    { label: "何かを手で作る", effects: { dex: 2, chi: 1 } },
  ]},
  { text: "成功するか分からない大きな挑戦がある。あなたは？", options: [
    { label: "リスクを取って飛び込む", effects: { bold: 3, act: 1 } },
    { label: "情報を集めて慎重に判断", effects: { bold: -2, chi: 1 } },
    { label: "誰かを巻き込んで一緒に", effects: { cha: 2, extro: 1 } },
  ]},
  { text: "困っている見知らぬ人がいる。どうする？", options: [
    { label: "自分から声をかけて助ける", effects: { cha: 2, extro: 2 } },
    { label: "解決策だけ手早く渡す", effects: { chi: 1, dex: 1 } },
    { label: "様子を見て必要なら動く", effects: { bold: -1, chi: 1 } },
  ]},
  { text: "最後に。一番『こうなりたい』に近いのは？", options: [
    { label: "多くの人に影響を与える存在", effects: { cha: 2, act: 1 } },
    { label: "何かを極めた専門家", effects: { chi: 2, dex: 1 } },
    { label: "自由に生きる冒険者", effects: { bold: 2, act: 2 } },
    { label: "穏やかで満たされた暮らし", effects: { extro: -1, tain: 1 } },
  ]},
];

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const EMOTIONS = ["neutral", "happy", "angry", "sad", "shy", "surprise"];

function buildPlayer(answers, name) {
  const stats = { tain: 3, chi: 3, cha: 3, dex: 3, act: 3 };
  const axes = { extro: 0, bold: 0 };
  answers.forEach((eff) => Object.entries(eff).forEach(([k, v]) => {
    if (k in stats) stats[k] = clamp(stats[k] + v, 1, 10);
    else axes[k] = clamp((axes[k] || 0) + v, -5, 5);
  }));
  return { name: name || "あなた", stats, axes, condition: 100, mood: 60, costume: "school", emotion: "neutral" };
}

function buildWorld(player) {
  return {
    time: { day: 1, hour: 7, minute: 0 },
    location: "home",
    money: 42000,
    player,
    npcs: {
      haruka: { id: "haruka", name: "遥", note: "幼馴染", affinity: 45, trust: 50, alive: true, present: true, emotion: "happy" },
    },
    flags: [],
    log: [],
  };
}

// ---------- L3: Anthropic API ----------
// 世界の状態＋行動をAIに渡し、構造化JSONで反応を得る。
async function aiEngine(world, action) {
  const p = world.player;
  const npcList = Object.values(world.npcs).filter((n) => n.alive).map((n) =>
    `${n.id}(${n.name}): 好感度${n.affinity} 信頼${n.trust} ${n.present ? "この場にいる" : "不在"}`
  ).join("; ");

  const sys = `あなたは自由型人生シミュレーションゲームの世界エンジンです。プレイヤーの行動に対し、世界がどう反応するかを生成します。

# 世界のルール
- 起点は現代日本。ただしプレイヤーが望めば、どんな方向にも世界は変化してよい（異世界・ファンタジー化も可）。
- 決まったストーリーはない。プレイヤーの選択が世界を作る。
- 一貫性を厳守: 既存NPCの名前・生死・関係を勝手に変えない。死んだ人物を復活させない。
- 描写は簡潔に2〜4文。日本語。プレイヤー名は「${p.name}」。

# 現在の状態
時刻: ${world.time.day}日目 ${world.time.hour}時${world.time.minute}分 / 場所: ${world.location} / 所持金: ${world.money}円
プレイヤー能力: 体力${p.stats.tain} 知力${p.stats.chi} 魅力${p.stats.cha} 器用さ${p.stats.dex} 行動力${p.stats.act} / 体調${p.condition} 気分${p.mood}
NPC: ${npcList || "なし"}

# 出力形式（JSONのみ。前置き・コードフェンス禁止）
{
  "narration": "世界の反応の描写(2〜4文)",
  "diff": { "advanceMin": 分, "mood": 増減, "condition": 増減, "money": 増減, "npcAffinity": {"npcId": 増減} },
  "playerEmotion": "neutral|happy|angry|sad|shy|surprise のいずれか",
  "npcEmotions": { "npcId": "上記感情のいずれか" },
  "dialogue": { "npcId": "そのNPCの発話(あれば)" },
  "newNpcs": { "新id": {"name":"名前","note":"説明","affinity":30,"trust":20} }
}
不要なフィールドは省略可。npcAffinityはこの場にいて交流のあったNPCのみ。`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: `${sys}\n\nプレイヤーの行動:「${action}」\n\nJSONで反応を生成してください。` }],
    }),
  });
  const data = await resp.json();
  let text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  text = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(text);
  return parsed;
}

// ---------- L2 整合性ガード ----------
function verifyApply(world, res) {
  const w = structuredClone(world);
  const diff = res.diff || {};
  const rejected = [];

  let total = w.time.hour * 60 + w.time.minute + (diff.advanceMin || 30);
  while (total >= 1440) { total -= 1440; w.time.day += 1; }
  w.time.hour = Math.floor(total / 60); w.time.minute = total % 60;

  if (diff.money) {
    if (w.money + diff.money < 0) rejected.push("所持金が足りず、支払いはできなかった。");
    else w.money += diff.money;
  }
  if (diff.condition) w.player.condition = clamp(w.player.condition + diff.condition, 0, 100);
  if (diff.mood) w.player.mood = clamp(w.player.mood + diff.mood, 0, 100);

  if (diff.npcAffinity) Object.entries(diff.npcAffinity).forEach(([id, d]) => {
    const npc = w.npcs[id];
    if (!npc || !npc.alive) rejected.push(`不在の人物への関係変化は無効化された（${id}）。`);
    else npc.affinity = clamp(npc.affinity + Number(d), 0, 100);
  });

  // 新NPC: 重複IDは弾く。衣装をローテ割当。
  const npcCostumes = Object.keys(CHAR_DATA.npcs);
  if (res.newNpcs) Object.entries(res.newNpcs).forEach(([id, npc]) => {
    if (!w.npcs[id]) {
      const idx = Object.keys(w.npcs).length % npcCostumes.length;
      w.npcs[id] = { id, name: npc.name || id, note: npc.note || "", affinity: npc.affinity ?? 30, trust: npc.trust ?? 20, alive: true, present: true, sprite: npcCostumes[idx], emotion: "neutral" };
    }
  });

  // 表情反映
  const pe = EMOTIONS.includes(res.playerEmotion) ? res.playerEmotion : "neutral";
  w.player.emotion = pe;
  if (res.npcEmotions) Object.entries(res.npcEmotions).forEach(([id, e]) => {
    if (w.npcs[id] && EMOTIONS.includes(e)) w.npcs[id].emotion = e;
  });

  // ログ（発話も含める）
  let logText = res.narration || "（沈黙）";
  if (res.dialogue) Object.entries(res.dialogue).forEach(([id, line]) => {
    const nm = w.npcs[id]?.name || id;
    logText += `\n${nm}「${line}」`;
  });
  w.log = [...w.log, { ...w.time, text: logText }];
  return { world: w, rejected };
}

// ---------- 背景 ----------
function timeOfDay(h) { if (h < 6 || h >= 20) return "night"; if (h < 11) return "morning"; if (h < 16) return "noon"; return "evening"; }
const TIME_PAL = {
  morning: { s1: "#bcd4e6", s2: "#e8dcc0", sun: "#f5e6a8", g: "#8a9a7a" },
  noon: { s1: "#7fb0d8", s2: "#bcd9ee", sun: "#fdf3c0", g: "#7f956a" },
  evening: { s1: "#e89a5a", s2: "#c9607a", sun: "#f5c26b", g: "#5a5050" },
  night: { s1: "#2a2a4a", s2: "#3d3d5c", sun: "#e8e8f0", g: "#2f3040" },
};
function Background({ hour, place }) {
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

const fmt = (t) => `${t.day}日目 ${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;

// 立ち絵取得
function playerSprite(p) { return CHAR_DATA.costumes[p.costume]?.[p.emotion] || CHAR_DATA.costumes[p.costume]?.neutral; }
function npcSprite(n) {
  const set = CHAR_DATA.npcs[n.sprite] || CHAR_DATA.npcs[n.id] || Object.values(CHAR_DATA.npcs)[0];
  return set?.[n.emotion] || set?.neutral;
}

export default function LifeSim() {
  const [phase, setPhase] = useState("intro");
  const [name, setName] = useState("");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [world, setWorld] = useState(null);
  const [input, setInput] = useState("");
  const [rejected, setRejected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showStats, setShowStats] = useState(false);
  const logRef = useRef(null);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [world?.log?.length, loading]);

  function answer(effects) {
    const next = [...answers, effects];
    if (qi + 1 < CREATION_QUESTIONS.length) { setAnswers(next); setQi(qi + 1); }
    else {
      const w = buildWorld(buildPlayer(next, name));
      w.log.push({ ...w.time, text: `${w.player.name}の一日が始まる。窓の外は、いつもと変わらない現代の朝。ここから何をするかは、あなた次第だ。` });
      setWorld(w); setPhase("play");
    }
  }

  async function act(text) {
    if (!world || loading || !text.trim()) return;
    setLoading(true); setError(""); setInput("");
    try {
      const res = await aiEngine(world, text);
      const { world: nw, rejected: rej } = verifyApply(world, res);
      setWorld(nw); setRejected(rej);
    } catch (e) {
      setError("世界の反応の生成に失敗しました。もう一度お試しください。");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const bg = "#efeadd", ink = "#2b2620", accent = "#6b7a5a";

  if (phase === "intro") return (
    <Shell bg={bg}>
      <div style={{ maxWidth: 420, margin: "0 auto", paddingTop: 56, textAlign: "center" }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: accent, marginBottom: 14 }}>A LIFE, UNWRITTEN</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, color: ink, lineHeight: 1.3, margin: "0 0 18px" }}>まだ、何も<br />決まっていない</h1>
        <p style={{ color: "#6b6559", fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>決まった物語はありません。世界はあなたの行動にAIが応じて姿を変えます。始まりは——今、ここ。</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="あなたの名前" style={inp} />
        <button style={btn(accent)} onClick={() => setPhase("creation")}>はじめる</button>
      </div>
    </Shell>
  );

  if (phase === "creation") {
    const q = CREATION_QUESTIONS[qi];
    return (
      <Shell bg={bg}>
        <div style={{ maxWidth: 480, margin: "0 auto", paddingTop: 44 }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: accent, marginBottom: 22 }}>あなたを知る　{qi + 1} / {CREATION_QUESTIONS.length}</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 21, color: ink, lineHeight: 1.6, marginBottom: 26 }}>{q.text}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((o, i) => <button key={i} style={choice} onClick={() => answer(o.effects)}>{o.label}</button>)}
          </div>
        </div>
      </Shell>
    );
  }

  const p = world.player;
  const presentNpcs = Object.values(world.npcs).filter((n) => n.alive && n.present);
  const costumes = [["school", "制服"], ["suit", "スーツ"], ["nurse", "ナース"], ["kimono", "和服"], ["dress", "ドレス"]];

  return (
    <Shell bg={bg}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 17, color: ink }}>{fmt(world.time)}</div>
          <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 14, color: "#6b6559" }}>
            <span>¥{world.money.toLocaleString()}</span><span>体調 {p.condition}</span><span>気分 {p.mood}</span>
            <button style={miniBtn} onClick={() => setShowStats(!showStats)}>{showStats ? "能力を隠す" : "能力"}</button>
          </div>
        </div>
        {showStats && (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", background: "#fbf9f3", border: "1px solid #e0dccf", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
            {Object.entries(STAT_DEFS).map(([k, l]) => <span key={k} style={{ fontSize: 13, color: "#6b6559" }}>{l} <b style={{ color: ink }}>{p.stats[k]}</b></span>)}
          </div>
        )}

        <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap" }}>
          {/* シーン: 背景＋プレイヤーとNPCを並べる */}
          <div style={{ position: "relative", width: 360, height: 470, borderRadius: 14, overflow: "hidden", border: "1px solid #e0dccf", flexShrink: 0, background: "#cdd8e0" }}>
            <Background hour={world.time.hour} place={world.location} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4 }}>
              {/* プレイヤー */}
              <Figure src={playerSprite(p)} label={p.name} emotion={p.emotion} dim={loading} />
              {/* 同席NPC（最大2体まで大きく） */}
              {presentNpcs.slice(0, 2).map((n) => (
                <Figure key={n.id} src={npcSprite(n)} label={n.name} emotion={n.emotion} dim={loading} />
              ))}
            </div>
            <div style={{ position: "absolute", top: 8, left: 8, right: 8, display: "flex", gap: 5, flexWrap: "wrap" }}>
              {costumes.map(([v, jp]) => (
                <button key={v} onClick={() => setWorld({ ...world, player: { ...p, costume: v } })}
                  style={{ padding: "4px 9px", fontSize: 11, borderRadius: 14, cursor: "pointer", border: "none",
                    background: p.costume === v ? "rgba(107,122,90,.95)" : "rgba(255,255,255,.75)", color: p.costume === v ? "#fff" : "#4b4740" }}>{jp}</button>
              ))}
            </div>
          </div>

          {/* ログ＋行動 */}
          <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column" }}>
            <div ref={logRef} style={{ ...logBox, flex: 1 }}>
              {world.log.map((e, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: "#b5af9e", marginBottom: 3 }}>{e.day}日目 {String(e.hour).padStart(2, "0")}:{String(e.minute).padStart(2, "0")}</div>
                  <div style={{ fontSize: 15, color: ink, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{e.text}</div>
                </div>
              ))}
              {loading && <div style={{ fontSize: 14, color: "#a8a291", fontStyle: "italic" }}>世界が動いている…</div>}
            </div>

            {error && <div style={{ ...rejBox, borderColor: "#e0b0a0" }}><span style={{ fontSize: 12, color: "#b5543a" }}>{error}</span></div>}
            {rejected.length > 0 && <div style={rejBox}>{rejected.map((r, i) => <div key={i} style={{ fontSize: 12, color: "#9a6a4a" }}>⚠ {r}</div>)}</div>}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
              {["働く", "食事をとる", "遥に話しかける", "休む"].map((q) => <button key={q} style={{ ...quick, opacity: loading ? 0.5 : 1 }} disabled={loading} onClick={() => act(q)}>{q}</button>)}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && act(input)}
                disabled={loading} placeholder="自由に行動を書く" style={{ ...inp, marginBottom: 0, flex: 1, opacity: loading ? 0.6 : 1 }} />
              <button style={{ ...btn(accent), opacity: loading ? 0.5 : 1 }} disabled={loading} onClick={() => act(input)}>{loading ? "…" : "行動"}</button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 10, color: "#b5af9e", marginTop: 16 }}>立ち絵素材：立ち絵さん（キャラクター作成セット）／ 世界生成：Claude</div>
      </div>
    </Shell>
  );
}

function Figure({ src, label, emotion, dim }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transition: "opacity .3s", opacity: dim ? 0.7 : 1 }}>
      {src && <img src={`data:image/png;base64,${src}`} alt={label} style={{ height: 400, filter: "drop-shadow(0 4px 8px rgba(0,0,0,.25))" }} />}
      <div style={{ marginTop: -6, fontSize: 12, color: "#4b4740", background: "rgba(255,255,255,.8)", padding: "1px 10px", borderRadius: 10 }}>{label}</div>
    </div>
  );
}

function Shell({ children, bg }) {
  return <div style={{ minHeight: "100vh", background: bg, padding: "24px 18px", fontFamily: "system-ui, -apple-system, sans-serif" }}>{children}</div>;
}
const inp = { width: "100%", padding: "11px 14px", fontSize: 15, border: "1px solid #d8d3c4", borderRadius: 8, background: "#fdfcf8", color: "#2b2620", outline: "none", marginBottom: 14, boxSizing: "border-box" };
const btn = (a) => ({ padding: "11px 20px", fontSize: 15, border: "none", borderRadius: 8, background: a, color: "#fff", cursor: "pointer", whiteSpace: "nowrap" });
const choice = { padding: "15px 18px", fontSize: 15, textAlign: "left", border: "1px solid #d8d3c4", borderRadius: 10, background: "#fdfcf8", color: "#2b2620", cursor: "pointer" };
const quick = { padding: "8px 13px", fontSize: 13, border: "1px solid #d8d3c4", borderRadius: 18, background: "#fdfcf8", color: "#6b6559", cursor: "pointer" };
const miniBtn = { padding: "4px 10px", fontSize: 12, border: "1px solid #d8d3c4", borderRadius: 14, background: "#fdfcf8", color: "#6b6559", cursor: "pointer" };
const logBox = { background: "#fbf9f3", border: "1px solid #e0dccf", borderRadius: 12, padding: 20, height: 300, overflowY: "auto", marginBottom: 10 };
const rejBox = { background: "#f7efe6", border: "1px solid #e8d9c6", borderRadius: 8, padding: "9px 13px", marginBottom: 10 };
