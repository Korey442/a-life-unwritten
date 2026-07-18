// 立ち絵アセット解決。assets/chars/*.png を静的URLとして取り込み、
// {衣装}_{感情}.png / npc_{id}_{感情}.png の命名で引く。
const modules = import.meta.glob("../assets/chars/*.png", { eager: true, query: "?url", import: "default" });

// basename(拡張子なし) → URL
const byName = {};
for (const [path, url] of Object.entries(modules)) {
  const base = path.split("/").pop().replace(/\.png$/, "");
  byName[base] = url;
}

const pick = (...names) => {
  for (const n of names) if (byName[n]) return byName[n];
  return null;
};

export const COSTUMES = [
  ["school", "制服"], ["suit", "スーツ"], ["nurse", "ナース"], ["kimono", "和服"], ["dress", "ドレス"],
];

export function playerSprite(p) {
  return pick(`${p.costume}_${p.emotion}`, `${p.costume}_neutral`, "school_neutral");
}

export function npcSprite(n) {
  const id = n.sprite || n.id;
  return pick(`npc_${id}_${n.emotion}`, `npc_${id}_neutral`, "npc_stranger_neutral");
}
