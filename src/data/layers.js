// ネット層（ダンジョン）のデータ。層＝テーマ別ダンジョン。node を順に進み、最後が boss。
// enemy: { name, desc, difficulty, weak:[approachKey], resist:[approachKey], boss? }
// weak のアプローチは難度 -3、resist は +3。プレイヤーは強い能力に合う手を選ぶ＝最適化。

export const LAYERS = {
  sns_ruins: {
    id: "sns_ruins",
    title: "第一層：止まったSNSの廃墟",
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
};

export const LAYER_LIST = Object.values(LAYERS);
