// キャラメイク（固定4問の選択式）。回答の effects が初期ステータス/性格軸に反映される。
export const CREATION_QUESTIONS = [
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
