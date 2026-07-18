// クエストログ。offered(受ける/断る) / active(目標・締切) / 済(completed/failed/declined) をタブ表示。
// World State の quests を読むだけ。操作は onAccept/onDecline 経由で必ず状態機械へ。
import { useState } from "react";
import { STATUS, byStatus } from "../engine/quests.js";
import { fmtRemaining } from "../engine/time.js";
import { theme, card, btn } from "./styles.jsx";

const TABS = [
  { key: "offered", label: "提示中", statuses: [STATUS.OFFERED] },
  { key: "active", label: "進行中", statuses: [STATUS.ACTIVE] },
  { key: "done", label: "履歴", statuses: [STATUS.COMPLETED, STATUS.FAILED, STATUS.DECLINED] },
];

const STATUS_LABEL = { completed: "達成", failed: "失敗", declined: "辞退" };
const STATUS_COLOR = { completed: "#6b7a5a", failed: "#b5543a", declined: "#a8a291" };

function questsFor(world, tab) {
  return tab.statuses.flatMap((s) => byStatus(world, s));
}

function Objectives({ q }) {
  return (
    <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none" }}>
      {q.objectives.map((o, i) => (
        <li key={i} style={{ fontSize: 13, color: o.done ? "#8a8575" : theme.ink, marginBottom: 2 }}>
          <span style={{ color: o.done ? theme.accent : "#c4bfae" }}>{o.done ? "☑" : "☐"}</span> {o.text}
        </li>
      ))}
    </ul>
  );
}

export default function QuestLog({ world, onAccept, onDecline, loading }) {
  const [tab, setTab] = useState("offered");
  const active = TABS.find((t) => t.key === tab);
  const list = questsFor(world, active);
  const counts = Object.fromEntries(TABS.map((t) => [t.key, questsFor(world, t).length]));
  const giverName = (id) => (id && world.npcs[id]?.name) || null;

  return (
    <div style={{ background: "#fbf9f3", border: "1px solid #e0dccf", borderRadius: 12, padding: 14 }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex: 1, padding: "7px 4px", fontSize: 12, borderRadius: 8, cursor: "pointer",
              border: "1px solid " + (tab === t.key ? theme.accent : "#e0dccf"),
              background: tab === t.key ? theme.accent : "#fff", color: tab === t.key ? "#fff" : theme.sub }}>
            {t.label} {counts[t.key] > 0 ? `(${counts[t.key]})` : ""}
          </button>
        ))}
      </div>

      {list.length === 0 && <div style={{ fontSize: 13, color: "#a8a291", padding: "12px 4px", textAlign: "center" }}>
        {tab === "offered" ? "今は提示されているクエストはない。" : tab === "active" ? "受注中のクエストはない。" : "まだ履歴はない。"}
      </div>}

      {list.map((q) => (
        <div key={q.id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <strong style={{ fontSize: 14, color: theme.ink }}>{q.title}</strong>
            {q.status === STATUS.ACTIVE && <span style={{ fontSize: 11, color: q.deadline ? "#b5543a" : "#a8a291" }}>{fmtRemaining(world.time, q.deadline)}</span>}
            {["completed", "failed", "declined"].includes(q.status) && <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLOR[q.status] }}>{STATUS_LABEL[q.status]}</span>}
          </div>
          {giverName(q.giverNpcId) && <div style={{ fontSize: 11, color: theme.sub, marginTop: 2 }}>依頼主: {giverName(q.giverNpcId)}</div>}
          {q.description && <div style={{ fontSize: 12.5, color: theme.sub, marginTop: 4, lineHeight: 1.6 }}>{q.description}</div>}

          {q.status === STATUS.ACTIVE && (
            <>
              <Objectives q={q} />
              <div style={{ height: 5, background: "#eae4d5", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
                <div style={{ width: `${q.progress}%`, height: "100%", background: theme.accent, transition: "width .4s" }} />
              </div>
            </>
          )}

          {q.status === STATUS.OFFERED && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button disabled={loading} onClick={() => onAccept(q.id)} style={{ ...btn(theme.accent), padding: "7px 16px", fontSize: 13, opacity: loading ? 0.5 : 1 }}>受ける</button>
              <button disabled={loading} onClick={() => onDecline(q.id)} style={{ padding: "7px 16px", fontSize: 13, border: "1px solid #d8d3c4", borderRadius: 8, background: "#fdfcf8", color: theme.sub, cursor: "pointer", opacity: loading ? 0.5 : 1 }}>断る</button>
              {q.reward?.money ? <span style={{ alignSelf: "center", fontSize: 11, color: "#a8a291" }}>報酬 ¥{q.reward.money.toLocaleString()}</span> : null}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
