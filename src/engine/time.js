// 時刻ユーティリティ。World Time は {day, hour, minute}（決定論的）。
export const MIN_PER_DAY = 1440;

export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// {day,hour,minute} を「1日目0:00からの通算分」に変換
export function toMinutes(t) {
  return (t.day - 1) * MIN_PER_DAY + t.hour * 60 + t.minute;
}

// 通算分を {day,hour,minute} に戻す
export function fromMinutes(m) {
  const day = Math.floor(m / MIN_PER_DAY) + 1;
  const rem = m % MIN_PER_DAY;
  return { day, hour: Math.floor(rem / 60), minute: rem % 60 };
}

// t に min 分進めた新しい時刻を返す（非破壊）
export function advance(t, min) {
  return fromMinutes(toMinutes(t) + Math.max(0, Math.round(min)));
}

// a と b を比較。a<b:-1 / a==b:0 / a>b:1
export function compare(a, b) {
  const d = toMinutes(a) - toMinutes(b);
  return d < 0 ? -1 : d > 0 ? 1 : 0;
}

// deadline を過ぎているか（now が deadline より後）
export function isPast(now, deadline) {
  if (!deadline) return false;
  return compare(now, deadline) > 0;
}

// 残り時間（分）。過ぎていれば負。
export function minutesUntil(now, deadline) {
  if (!deadline) return Infinity;
  return toMinutes(deadline) - toMinutes(now);
}

export const fmt = (t) =>
  `${t.day}日目 ${String(t.hour).padStart(2, "0")}:${String(t.minute).padStart(2, "0")}`;

// 残り時間を人間可読に（締切表示用）
export function fmtRemaining(now, deadline) {
  if (!deadline) return "期限なし";
  const m = minutesUntil(now, deadline);
  if (m < 0) return "期限切れ";
  const days = Math.floor(m / MIN_PER_DAY);
  const hours = Math.floor((m % MIN_PER_DAY) / 60);
  if (days > 0) return `残り${days}日${hours}時間`;
  if (hours > 0) return `残り${hours}時間`;
  return `残り${m}分`;
}
