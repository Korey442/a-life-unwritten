// ネット層（ダンジョン）の状態機械。現実↔ネットのダイブ、ノード進行、遭遇解決。
// 判定は決定論的（checks.js）＝AI不要で遊べる芯。世界は非破壊で更新する。
import { clamp, advance } from "./time.js";
import { LAYERS, isLayerUnlocked } from "../data/layers.js";
import { APPROACHES, skillCheck } from "./checks.js";

export const DIVE = { TIME_PER_NODE: 20, ASSISTS: 2 };
// 判定結果ごとの体力消耗（condition を HP として使う）
const DMG = { success: 2, partial: 8, fail: 14 };
const BOSS_DMG_MUL = 1.4;
const XP = { success: 3, partial: 1 };

export const inNet = (w) => w.location === "net" && !!w.dive;
export const currentNode = (w) => (inNet(w) ? w.dive.nodes[w.dive.index] : null);
export const currentEnemy = (w) => currentNode(w)?.enemy ?? null;
export const diveProgress = (w) => (inNet(w) ? { index: w.dive.index, total: w.dive.nodes.length } : null);

// 現実(home)からダイブ開始。ミリナが扉を開く。
// 層の開放は物語ビート（data/story.js）が flag `unlocked:<id>` を立てて行う＝物語より先へは潜れない。
export function startDive(world, layerId) {
  const layer = LAYERS[layerId];
  if (!layer || world.location !== "home") return { world, ok: false };
  if (!isLayerUnlocked(world, layerId)) return { world, ok: false, reason: "その層への扉は、まだ開いていない。" };
  const w = structuredClone(world);
  w.location = "net";
  w.dive = {
    layerId, title: layer.title,
    nodes: structuredClone(layer.nodes),
    index: 0, assists: DIVE.ASSISTS, cleared: false,
  };
  const first = !w.flags.includes("dived_once");
  if (first) w.flags = [...w.flags, "dived_once"];
  w.log = [...w.log, { ...w.time, kind: "dive", text: `ミリナが空間に“接続”の扉を開く。\n${layer.title}——${layer.intro}` }];
  return { world: w, ok: true };
}

// 遭遇を1手で解決。approachKey は APPROACHES のキー、または "milina"（ミリナに任せる）。
export function resolveEncounter(world, approachKey, rng = Math.random) {
  if (!inNet(world)) return { world, result: null };
  const enemy = currentEnemy(world);
  if (!enemy) return { world, result: null };
  const w = structuredClone(world);
  const dive = w.dive;
  const p = w.player;

  let result;
  if (approachKey === "milina") {
    if (dive.assists <= 0) return { world, result: { blocked: "ミリナの支援はもう残っていない。" } };
    dive.assists -= 1;
    if (w.npcs.milina) w.npcs.milina.affinity = clamp(w.npcs.milina.affinity + 1, 0, 100);
    result = { assist: true, outcome: "success", enemyName: enemy.name, dmg: 0, xp: 0,
      narration: `ミリナが割り込む。「ここはミリナが。——ご主人様は、前へ」。危険は彼女がいなした。` };
  } else {
    const approach = APPROACHES[approachKey];
    if (!approach) return { world, result: null };
    let diff = enemy.difficulty;
    if (enemy.weak?.includes(approachKey)) diff -= 3;
    if (enemy.resist?.includes(approachKey)) diff += 3;
    const check = skillCheck(p, approach, diff, rng);
    const mul = enemy.boss ? BOSS_DMG_MUL : 1;
    const dmg = Math.round(DMG[check.outcome] * mul);
    p.condition = clamp(p.condition - dmg, 0, 100);
    // 使ったスキルが成長（成功で大きく、辛勝で少し）
    let xp = XP[check.outcome] || 0;
    if (xp) p.skills[approach.skill] = clamp((p.skills[approach.skill] ?? 0) + xp, 0, 100);
    result = { check, approach: approachKey, outcome: check.outcome, enemyName: enemy.name, dmg, xp,
      narration: encounterNarration(enemy, approach, check) };
  }

  // 時間経過
  w.time = advance(w.time, DIVE.TIME_PER_NODE);

  // 前進判定
  const advanced = result.outcome === "success" || result.outcome === "partial";
  if (advanced) {
    if (dive.index >= dive.nodes.length - 1) { dive.cleared = true; result.cleared = true; }
    else dive.index += 1;
  }
  result.advanced = advanced;

  // 体力尽きたら強制切断
  if (p.condition <= 0) result.defeated = true;

  w.log = [...w.log, { ...w.time, kind: "net", text: netLogLine(result) }];
  return { world: w, result };
}

function encounterNarration(enemy, approach, check) {
  const head = `「${enemy.name}」に${approach.name}で挑む`;
  if (check.outcome === "success") return `${head}——通った。`;
  if (check.outcome === "partial") return `${head}——辛くも切り抜けたが、消耗した。`;
  return `${head}——弾かれた。手痛い反撃を受ける。`;
}

function netLogLine(r) {
  if (r.assist) return r.narration;
  const c = r.check;
  const nums = `判定 ${c.statVal}+${c.skillVal}+🎲${c.dice} = ${c.total} / 難度 ${c.difficulty}`;
  const tag = c.outcome === "success" ? "成功" : c.outcome === "partial" ? "辛勝" : "失敗";
  return `${r.narration}\n［${tag}｜${nums}｜体力 -${r.dmg}${r.xp ? `｜${c.skill}+${r.xp}` : ""}］`;
}

// ダイブ終了。mode: "cleared" | "retreat" | "defeated"
export function endDive(world, mode) {
  if (!inNet(world)) return { world };
  const w = structuredClone(world);
  const layer = LAYERS[w.dive.layerId];
  const p = w.player;
  w.location = "home";
  const events = [];

  if (mode === "cleared") {
    const r = layer.reward || {};
    if (r.money) w.money = Math.max(0, w.money + r.money);
    if (r.mood) p.mood = clamp(p.mood + r.mood, 0, 100);
    if (r.skill) for (const [k, v] of Object.entries(r.skill)) p.skills[k] = clamp((p.skills[k] ?? 0) + v, 0, 100);
    if (r.affinity) for (const [id, v] of Object.entries(r.affinity)) if (w.npcs[id]) w.npcs[id].affinity = clamp(w.npcs[id].affinity + v, 0, 100);
    w.flags = [...w.flags, `restored:${layer.id}`];
    if (w.npcs.milina) w.npcs.milina.emotion = "happy";
    events.push({ kind: "restore", text: `${layer.restoreText}\nミリナ「……やりましたね、ご主人様。ひとつ、取り戻しました」` });
  } else if (mode === "defeated") {
    p.condition = Math.max(p.condition, 5);
    p.mood = clamp(p.mood - 12, 0, 100);
    events.push({ kind: "retreat", text: "体力が尽き、意識ごと現実へ弾き出された。ミリナが強制的に接続を切ったのだ。" });
  } else {
    p.mood = clamp(p.mood - 6, 0, 100);
    events.push({ kind: "retreat", text: "ミリナが接続を切る。層はまだ、生きている。——出直そう。" });
  }
  delete w.dive;
  w.log = [...w.log, ...events.map((e) => ({ ...w.time, kind: e.kind, text: e.text }))];
  return { world: w, mode, events };
}
