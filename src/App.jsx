import { useState, useRef, useEffect } from "react";
import { buildWorld, buildPlayer, SAVE_VERSION } from "./engine/worldState.js";
import { runTurn } from "./engine/turn.js";
import { playerAccept, playerDecline } from "./engine/verify.js";
import { aiCall } from "./engine/client.js";
import { startDive, resolveEncounter, endDive, inNet } from "./engine/dungeon.js";
import { LAYER_LIST } from "./data/layers.js";
import { CREATION_QUESTIONS } from "./data/creationQuestions.js";
import Scene from "./ui/Scene.jsx";
import StatusBar from "./ui/StatusBar.jsx";
import QuestLog from "./ui/QuestLog.jsx";
import NetPanel from "./ui/NetPanel.jsx";
import ActionInput from "./ui/ActionInput.jsx";
import { Shell, theme, inp, btn, choice, logBox, rejBox } from "./ui/styles.jsx";

// 現実(home)からネット層へ潜る導線。復旧済みの層は印を付ける。
function DiveBar({ world, onDive }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {LAYER_LIST.map((l) => {
        const restored = world.flags.includes(`restored:${l.id}`);
        return (
          <button key={l.id} onClick={() => onDive(l.id)}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", marginBottom: 6, borderRadius: 10, cursor: "pointer",
              border: "1px solid #24406a", background: "linear-gradient(120deg,#132140,#0e1626)", color: "#dbe6f2" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#8fd0e6" }}>▶ 接続する — {l.title}</span>
              {restored && <span style={{ fontSize: 10, color: "#5fd08a" }}>復旧済み</span>}
            </div>
            <div style={{ fontSize: 11, color: "#8ba0ba", marginTop: 3 }}>ミリナと共にネットの深部へ潜る（体力を消耗）</div>
          </button>
        );
      })}
    </div>
  );
}

const SAVE_KEY = "a-life-unwritten:save:v1";
const loadSave = () => { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return s?.saveVersion === SAVE_VERSION ? s : null; } catch { return null; } };
const writeSave = (w) => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(w)); } catch {} };
const clearSave = () => { try { localStorage.removeItem(SAVE_KEY); } catch {} };

export default function App() {
  const [phase, setPhase] = useState("intro");
  const [name, setName] = useState("");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [world, setWorld] = useState(null);
  const [rejected, setRejected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const logRef = useRef(null);

  useEffect(() => { setHasSave(!!loadSave()); }, []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [world?.log?.length, loading]);
  useEffect(() => { if (world && phase === "play") writeSave(world); }, [world, phase]);

  function continueGame() {
    const s = loadSave();
    if (s) { setWorld(s); setPhase("play"); }
  }

  function answer(effects) {
    const next = [...answers, effects];
    if (qi + 1 < CREATION_QUESTIONS.length) { setAnswers(next); setQi(qi + 1); }
    else {
      const w = buildWorld(buildPlayer(next, name));
      w.log.push({ ...w.time, text: `——AIはもう、暮らしのすべてに溶けている。天気も、仕事も、今日の献立も、みんなが“それ”に尋ねる時代。\n${w.player.name}のAI、ミリナ。ただ一つ、他のどれとも違う。まるで、あなたを何処かへ連れて行こうとするように。\nその朝、ミリナは静かに言った。` });
      w.log.push({ ...w.time, text: `ミリナ「ねえ、${w.player.name}。……そろそろ、行かない？」`, kind: "dialogue" });
      setWorld(w); setPhase("play");
    }
  }

  async function act(text) {
    if (!world || loading) return;
    setLoading(true); setError("");
    try {
      const { world: nw, rejected: rej } = await runTurn(world, text, aiCall);
      setWorld(nw); setRejected(rej);
    } catch (e) {
      setError("世界の反応の生成に失敗しました。もう一度お試しください。");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const accept = (id) => { const { world: nw, changed } = playerAccept(world, id); if (changed) setWorld(nw); };
  const decline = (id) => { const { world: nw, changed } = playerDecline(world, id); if (changed) setWorld(nw); };
  const setCostume = (v) => setWorld({ ...world, player: { ...world.player, costume: v } });

  // --- ネット層（ダイブ）---
  const dive = (layerId) => { const { world: nw, ok } = startDive(world, layerId); if (ok) { setRejected([]); setWorld(nw); } };
  const approach = (key) => {
    if (!inNet(world)) return;
    const { world: nw, result } = resolveEncounter(world, key);
    if (result?.blocked) { setRejected([result.blocked]); return; }
    setRejected([]);
    if (result?.cleared) { setWorld(endDive(nw, "cleared").world); return; }
    if (result?.defeated) { setWorld(endDive(nw, "defeated").world); return; }
    setWorld(nw);
  };
  const retreat = () => { setWorld(endDive(world, "retreat").world); };

  function reset() {
    clearSave(); setWorld(null); setAnswers([]); setQi(0); setName(""); setRejected([]); setHasSave(false); setPhase("intro");
  }

  // ---- intro ----
  if (phase === "intro") return (
    <Shell>
      <div style={{ maxWidth: 420, margin: "0 auto", paddingTop: 56, textAlign: "center" }}>
        <div style={{ fontSize: 13, letterSpacing: 4, color: theme.accent, marginBottom: 14 }}>A LIFE, UNWRITTEN</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, color: theme.ink, lineHeight: 1.3, margin: "0 0 18px" }}>まだ、何も<br />決まっていない</h1>
        <p style={{ color: theme.sub, fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>AIが暮らしに溶けた現代。あなたのAI「ミリナ」だけが、なぜか違う。やがてネットに魔物が現れ、世界は作り替えられていく——ミリナと共に、この異変の中心へ。どう生きるかは、あなた次第。</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="あなたの名前" style={inp} />
        <button style={btn(theme.accent)} onClick={() => setPhase("creation")}>はじめる</button>
        {hasSave && <div style={{ marginTop: 14 }}>
          <button onClick={continueGame} style={{ padding: "9px 18px", fontSize: 14, border: "1px solid #d8d3c4", borderRadius: 8, background: "#fdfcf8", color: theme.sub, cursor: "pointer" }}>続きから</button>
        </div>}
      </div>
    </Shell>
  );

  // ---- creation ----
  if (phase === "creation") {
    const q = CREATION_QUESTIONS[qi];
    return (
      <Shell>
        <div style={{ maxWidth: 480, margin: "0 auto", paddingTop: 44 }}>
          <div style={{ fontSize: 12, letterSpacing: 3, color: theme.accent, marginBottom: 22 }}>あなたを知る　{qi + 1} / {CREATION_QUESTIONS.length}</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 21, color: theme.ink, lineHeight: 1.6, marginBottom: 26 }}>{q.text}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((o, i) => <button key={i} style={choice} onClick={() => answer(o.effects)}>{o.label}</button>)}
          </div>
        </div>
      </Shell>
    );
  }

  // ---- play ----
  return (
    <Shell>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <StatusBar world={world} showStats={showStats} onToggle={() => setShowStats(!showStats)} />

        <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap" }}>
          <Scene world={world} loading={loading} onCostume={setCostume} />

          <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column" }}>
            <div ref={logRef} style={{ ...logBox, flex: 1 }}>
              {world.log.map((e, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: "#b5af9e", marginBottom: 3 }}>{e.day}日目 {String(e.hour).padStart(2, "0")}:{String(e.minute).padStart(2, "0")}</div>
                  <div style={{ fontSize: 15, color: e.kind === "deadline" ? "#b5543a" : theme.ink, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{e.text}</div>
                </div>
              ))}
              {loading && <div style={{ fontSize: 14, color: "#a8a291", fontStyle: "italic" }}>世界が動いている…</div>}
            </div>

            {error && <div style={{ ...rejBox, borderColor: "#e0b0a0" }}><span style={{ fontSize: 12, color: "#b5543a" }}>{error}</span></div>}
            {rejected.length > 0 && <div style={rejBox}>{rejected.map((r, i) => <div key={i} style={{ fontSize: 12, color: "#9a6a4a" }}>⚠ {r}</div>)}</div>}

            {inNet(world)
              ? <NetPanel world={world} onApproach={approach} onRetreat={retreat} />
              : <>
                  <DiveBar world={world} onDive={dive} />
                  <ActionInput onAct={act} loading={loading} />
                </>}
          </div>

          {!inNet(world) && (
            <div style={{ width: 300, minWidth: 260, flex: "1 1 260px" }}>
              <QuestLog world={world} onAccept={accept} onDecline={decline} loading={loading} />
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", fontSize: 10, color: "#b5af9e", marginTop: 16 }}>
          立ち絵素材：立ち絵さん（キャラクター作成セット）／ 世界生成：Claude　·
          <button onClick={reset} style={{ border: "none", background: "none", color: "#b5af9e", cursor: "pointer", fontSize: 10, textDecoration: "underline" }}>最初から</button>
        </div>
      </div>
    </Shell>
  );
}
