// 共有スタイル（参考実装のトーンを踏襲）。
export const theme = { bg: "#efeadd", ink: "#2b2620", accent: "#6b7a5a", sub: "#6b6559", line: "#e0dccf" };

export const inp = { width: "100%", padding: "11px 14px", fontSize: 15, border: "1px solid #d8d3c4", borderRadius: 8, background: "#fdfcf8", color: "#2b2620", outline: "none", marginBottom: 14, boxSizing: "border-box" };
export const btn = (a) => ({ padding: "11px 20px", fontSize: 15, border: "none", borderRadius: 8, background: a, color: "#fff", cursor: "pointer", whiteSpace: "nowrap" });
export const choice = { padding: "15px 18px", fontSize: 15, textAlign: "left", border: "1px solid #d8d3c4", borderRadius: 10, background: "#fdfcf8", color: "#2b2620", cursor: "pointer" };
export const quick = { padding: "8px 13px", fontSize: 13, border: "1px solid #d8d3c4", borderRadius: 18, background: "#fdfcf8", color: "#6b6559", cursor: "pointer" };
export const miniBtn = { padding: "4px 10px", fontSize: 12, border: "1px solid #d8d3c4", borderRadius: 14, background: "#fdfcf8", color: "#6b6559", cursor: "pointer" };
export const logBox = { background: "#fbf9f3", border: "1px solid #e0dccf", borderRadius: 12, padding: 20, height: 300, overflowY: "auto", marginBottom: 10 };
export const rejBox = { background: "#f7efe6", border: "1px solid #e8d9c6", borderRadius: 8, padding: "9px 13px", marginBottom: 10 };
export const card = { background: "#fbf9f3", border: "1px solid #e0dccf", borderRadius: 10, padding: "12px 14px", marginBottom: 10 };

export function Shell({ children }) {
  return <div style={{ minHeight: "100vh", background: theme.bg, padding: "24px 18px", fontFamily: "system-ui, -apple-system, sans-serif" }}>{children}</div>;
}
