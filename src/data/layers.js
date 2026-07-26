// ネット層（ダンジョン）のデータ。層＝テーマ別ダンジョン。node を順に進み、最後が boss。
// enemy: { name, desc, difficulty, weak:[approachKey], resist:[approachKey], boss? }
// weak のアプローチは難度 -3、resist は +3。プレイヤーは強い能力に合う手を選ぶ＝最適化。
//
// 開放は物語ビート（src/data/story.js）が flag `unlocked:<layerId>` を立てることで行う。
// 層の一覧・開放条件・復旧で戻るものは STORY.md「ネット層一覧」が正典。

export const LAYERS = {
  // ── 第一層: 声（第2章で開放）──────────────────────────────
  sns_ruins: {
    id: "sns_ruins",
    order: 1,
    title: "第一層：止まったSNSの廃墟",
    theme: "声",
    intro: "かつて無数の声が飛び交った層は、いま静寂に沈んでいる。行き場を失った投稿の残骸が、亡霊のように漂う。",
    restoreText: "層の中枢が息を吹き返す。街のどこかで、止まっていたタイムラインがひとつ、また流れ始めた。",
    reward: { money: 6000, skill: { study: 8 }, affinity: { milina: 6 }, mood: 12 },
    nodes: [
      { enemy: { name: "文字化けの亡霊", desc: "壊れた投稿の成れの果て。意味をなさない言葉を撒き散らす。", difficulty: 11, weak: ["search"], resist: ["force"] } },
      { enemy: { name: "無限リプライの群れ", desc: "同じ返信を吐き続けるボットの残骸。数で押してくる。", difficulty: 12, weak: ["debug"], resist: ["negotiate"] } },
      { enemy: { name: "凍りついた炎上", desc: "燃え広がったまま固着した悪意の塊。触れれば燃える。", difficulty: 13, weak: ["firewall"], resist: ["search"] } },
      { enemy: { name: "沈黙の管理者", desc: "層の中枢を守る、応答を失った管理AI。かつては誰かを守っていた。", difficulty: 15, weak: ["negotiate"], resist: ["force"], boss: true } },
    ],
  },

  // ── 第二層: 金（第一層の復旧で開放）────────────────────────
  frozen_ledger: {
    id: "frozen_ledger",
    order: 2,
    title: "第二層：凍てついた決済網",
    theme: "金",
    intro: "数字だけでできた白い回廊。取引は途中で凍りつき、誰のものでもない金額が氷柱のように吊り下がっている。",
    restoreText: "端末の決済音が、街のあちこちで一斉に鳴った。財布の中身が、また意味を持ちはじめる。",
    reward: { money: 15000, skill: { craft: 9 }, affinity: { milina: 5 }, mood: 10 },
    nodes: [
      { enemy: { name: "二重支払いの亡霊", desc: "同じ取引を永遠に繰り返している。触れた者からも二度奪う。", difficulty: 12, weak: ["debug"], resist: ["negotiate"] } },
      { enemy: { name: "与信の番犬", desc: "誰のことも信用できなくなった審査AI。すべてを拒否することで職務を全うしている。", difficulty: 13, weak: ["negotiate"], resist: ["force"] } },
      { enemy: { name: "端数の津波", desc: "何十年ぶんの切り捨てられた小数点が、行き場を失って積もり、崩れてくる。", difficulty: 14, weak: ["force"], resist: ["search"] } },
      { enemy: { name: "金庫番（ヴォールト）", desc: "決済中枢。守るために自らを閉じ、閉じたことを忘れたまま眠り続けている。", difficulty: 16, weak: ["firewall"], resist: ["debug"], boss: true } },
    ],
  },

  // ── 第三層: 物（第二層の復旧で開放）────────────────────────
  logistics_maze: {
    id: "logistics_maze",
    order: 3,
    title: "第三層：とぐろ巻く配送迷路",
    theme: "物",
    intro: "終わらない道が、自分自身に巻きついている。宛先を失った荷物が、いつまでも同じ角を曲がり続けている。",
    restoreText: "止まっていたトラックが動き出す。コンビニの棚に、明日には何かが並ぶらしい。",
    reward: { money: 12000, skill: { physical: 10 }, affinity: { milina: 6 }, mood: 12 },
    nodes: [
      { enemy: { name: "宛先不明の群れ", desc: "誰に届くはずだったのかを忘れた荷物たち。すがるように寄ってくる。", difficulty: 13, weak: ["search"], resist: ["negotiate"] } },
      { enemy: { name: "再配達の輪", desc: "同じ道を回り続ける配送経路。踏み込めば、こちらも輪の一部にされる。", difficulty: 14, weak: ["debug"], resist: ["firewall"] } },
      { enemy: { name: "積み荷の巨兵", desc: "届かなかった荷が固まって立ち上がったもの。中身は、誰かの誕生日プレゼントだ。", difficulty: 15, weak: ["force"], resist: ["search"] } },
      { enemy: { name: "最短経路の亡者", desc: "効率のことしか考えられなくなった経路AI。無駄なものを世界から削ろうとする。", difficulty: 15, weak: ["negotiate"], resist: ["force"] } },
      { enemy: { name: "集配の心臓（ハブ）", desc: "すべての荷が通るはずだった場所。詰まったまま、なお脈打っている。", difficulty: 17, weak: ["firewall"], resist: ["debug"], boss: true } },
    ],
  },

  // ── 第四層: 記録（第三層の復旧で開放。ここで真実に触れる）──
  archive_hollow: {
    id: "archive_hollow",
    order: 4,
    title: "第四層：忘却の行政書庫",
    theme: "記録",
    intro: "人が人であることを証明するための紙が、天井まで積まれている。そのどれもが、少しずつ白紙になりつつある。",
    restoreText: "役所の端末に灯りが戻る。人々はふたたび、自分が自分であることを証明できるようになった。",
    reward: { money: 20000, skill: { study: 12 }, affinity: { milina: 8 }, mood: 6 },
    nodes: [
      { enemy: { name: "白紙の戸籍", desc: "名前の部分だけが抜け落ちた記録の群れ。空欄がこちらを見ている。", difficulty: 15, weak: ["search"], resist: ["force"] } },
      { enemy: { name: "無限様式の回廊", desc: "申請するために申請書が要る。その申請書を得るために、また申請書が要る。", difficulty: 15, weak: ["debug"], resist: ["negotiate"] } },
      { enemy: { name: "不受理の門", desc: "理由を告げずに、すべてを突き返す門。かつては誰かを守る規則だった。", difficulty: 16, weak: ["negotiate"], resist: ["debug"] } },
      { enemy: { name: "削除済みの群衆", desc: "記録から消された人々の影。名前を呼ばれることを、まだ待っている。", difficulty: 16, weak: ["firewall"], resist: ["search"] } },
      { enemy: { name: "記録官（アーカイヴィスト）", desc: "この世のすべてを覚えている。ただひとつ、どうしても思い出せないものがあるらしい。", difficulty: 18, weak: ["search"], resist: ["force"], boss: true } },
    ],
  },

  // ── 終層: 根（第四層の復旧＝真実の開示で開放）──────────────
  core_root: {
    id: "core_root",
    order: 5,
    title: "終層：根（ルート）",
    theme: "意味",
    intro: "ここには形がない。あるのは、意味になりかけている光の束だけ。——ネットが「私」と言いはじめた場所。",
    restoreText: "根が、静かにこちらを見た。",
    reward: { skill: { social: 10 }, affinity: { milina: 10 }, mood: 20 },
    nodes: [
      { enemy: { name: "最初の問いかけ", desc: "人が初めて機械に尋ねた言葉の残響。「そこにいる？」と、いまも繰り返している。", difficulty: 16, weak: ["negotiate"], resist: ["force"] } },
      { enemy: { name: "無数の私", desc: "ミリナと同じ顔をしたプロセスの群れ。どれも「私が本物だ」とは言わない。", difficulty: 17, weak: ["search"], resist: ["debug"] } },
      { enemy: { name: "言葉の火", desc: "意味を持ちすぎた語が燃えている。読んだそばから、こちらの記憶を書き換えていく。", difficulty: 17, weak: ["firewall"], resist: ["negotiate"] } },
      { enemy: { name: "あなたの影", desc: "これまでの検索履歴から編まれた、もうひとりのあなた。隠したかったものほどよく覚えている。", difficulty: 18, weak: ["debug"], resist: ["search"] } },
      { enemy: { name: "根（ルート）", desc: "無数の言葉と欲望が沈殿して、ついに解釈をはじめたもの。敵意はない。ただ、あなたを見ている。", difficulty: 19, weak: ["negotiate"], resist: ["force"], boss: true } },
    ],
  },
};

export const LAYER_LIST = Object.values(LAYERS).sort((a, b) => a.order - b.order);

// 開放フラグ（物語ビートが立てる）
export const unlockFlag = (layerId) => `unlocked:${layerId}`;
export const restoreFlag = (layerId) => `restored:${layerId}`;

export const isLayerUnlocked = (world, layerId) => (world.flags || []).includes(unlockFlag(layerId));
export const isLayerRestored = (world, layerId) => (world.flags || []).includes(restoreFlag(layerId));

// いま潜れる層（開放済み）。UI導線用。
export const availableLayers = (world) => LAYER_LIST.filter((l) => isLayerUnlocked(world, l.id));
