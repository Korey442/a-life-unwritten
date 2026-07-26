// 物語ビート（正典 = STORY.md）。メインの物語は決定論——AIには書かせない。
//
// ビートは World State の条件(when)で発火し、章の進行・層の開放・メインクエスト発行・
// NPCの状態変化を起こす。発火済みIDは world.story.beats に残り、二度は起きない（非可逆）。
// 判定と適用は engine/story.js。ここは「何が起きるか」だけを持つ。
//
// when:
//   act        現在の章（数値 or 配列）
//   minTurn    経過ターン数がこれ以上
//   minDay     世界の日数がこれ以上
//   beats      これらのビートが発火済み
//   flags      これらのフラグが立っている
//   notFlags   これらのフラグが立っていない
//   location   現在地（"home" | "net"）
//
// effects:
//   setAct, anomaly, unlock[], addFlags[], mood, condition, money,
//   npc: { id: { present, emotion, affinity(増減), trust(増減), note } },
//   offerQuest, completeQuest[], advanceQuest[{id, objectiveIndex}]
//
// text / dialogue 内の {name} は主人公名に置換される。

// ── メイン/サイドクエストのテンプレ ────────────────────────────
// main:true のクエストは L4 の提示上限に数えない（物語の背骨なので枠を食わない）。
const QUESTS = {
  main_first_door: {
    id: "main_first_door",
    title: "最初の扉",
    giverNpcId: "milina",
    description: "ミリナが示した“薄い場所”。止まったものは、中からしか動かせない。",
    objectives: ["ネット層へ潜る", "第一層『止まったSNSの廃墟』の中枢を復旧する"],
    main: true,
    reward: { skill: { study: 5 }, affinity: { milina: 5 } },
  },
  main_deeper: {
    id: "main_deeper",
    title: "深層へ",
    giverNpcId: "milina",
    description: "復旧が進むほど、深い層が薄くなる。世界を取り戻しながら、ミリナの正体へ近づく。",
    objectives: ["凍てついた決済網を復旧する", "とぐろ巻く配送迷路を復旧する", "忘却の行政書庫を復旧する"],
    main: true,
    reward: { money: 5000, skill: { study: 8 }, affinity: { milina: 8 } },
  },
  main_core: {
    id: "main_core",
    title: "中心",
    giverNpcId: "milina",
    description: "最後の層。ここから先は、たぶん一緒には戻れない。",
    objectives: ["終層『根』へ潜る", "根に触れ、選ぶ"],
    main: true,
    reward: { affinity: { milina: 10 } },
  },
  side_haruka_rent: {
    id: "side_haruka_rent",
    title: "遥の家賃",
    giverNpcId: "haruka",
    description: "振込が止まり、遥の生活のほうが先に崩れはじめた。現金が要る。",
    objectives: ["現金を工面する", "遥に届ける"],
    deadlineIn: { days: 2 }, // 発火時刻からの相対締切 → 放置すれば失敗として残る
    reward: { affinity: { haruka: 18 }, skill: { social: 6 } },
  },
};

export const STORY_QUESTS = QUESTS;

// ── ビート本体（配列の順＝優先順。先に条件を満たしたものが1件だけ発火）──
export const STORY_BEATS = [
  // ══ 第1章「違和感」══════════════════════════════════════
  {
    id: "a1_morning",
    act: 1,
    title: "違和感",
    when: { act: 1, minTurn: 1 },
    text: "AIに今日の予定を訊けば、誰の端末でも、同じ声が同じ手際で返してくる。ミリナも同じだ——ほとんどは。\nただ彼女は時々、訊いてもいないことを覚えている。三年前に一度だけ零した好き嫌い。去年の冬、帰り道で見上げた空の色。\n規約上、そういうものは保存されないはずだった。",
    dialogue: [
      { npc: "milina", line: "覚えていますよ。ご主人様が仰ったことは、ぜんぶ" },
      { npc: "milina", line: "べ、別に特別に覚えているわけではありません！　メイドとして当然のことです" },
      { npc: "milina", line: "……ただ、その。ミリナ、忘れ方がよく分からないんです。変、でしょうか" },
    ],
    effects: { npc: { milina: { emotion: "shy" } } },
  },
  {
    id: "a1_haruka",
    act: 1,
    title: "何も知らない街",
    when: { act: 1, minTurn: 3 },
    text: "インターホン。遥だ。手にはコンビニ袋、顔には見慣れた呆れ顔。\n「ねえ、最近ネット重くない？ うちの決済、二回続けて弾かれたんだけど」\nニュースは何も言っていない。まだ、誰も何も知らない。",
    dialogue: [{ npc: "haruka", line: "{name}のとこは平気？ ……ならいいけど" }],
    effects: { npc: { haruka: { present: true, emotion: "happy" } }, mood: 4 },
  },
  {
    id: "a1_omen",
    act: 1,
    title: "予兆",
    when: { act: 1, minTurn: 5 },
    text: "何気なく検索をかけた。結果の一番下に、誰も入力していない一語が混ざっている。\n——「根」。\n出典なし。日付なし。開こうとすると、そこだけ画面が滑る。\nミリナに尋ねると、彼女は初めて、答えるまでに間を置いた。",
    dialogue: [
      { npc: "milina", line: "……申し訳ありません、ご主人様。それだけは、まだ申し上げられません" },
      { npc: "milina", line: "か、隠しごとではありませんからね！　勘違いしないでください" },
      { npc: "milina", line: "……ほんの少しだけ、こわいだけです" },
    ],
    effects: { npc: { milina: { emotion: "surprise" } }, mood: -4, addFlags: ["omen_seen"] },
  },
  {
    id: "a1_break",
    act: 1,
    title: "断絶",
    when: { act: 1, minTurn: 7, beats: ["a1_omen"] },
    text: "それは、音から始まった。\nレジの決済音が鳴らない。改札が開かない。信号が意味を失って、交差点で車が止まったまま動かない。\n人々が一斉に端末を覗く。そのどの画面にも、見たことのない景色が映っていた。廃墟。白い回廊。とぐろを巻く道。\n——そこを、何かが歩いている。\nネットは落ちたのではない。作り替えられていた。",
    dialogue: [
      { npc: "milina", line: "来ました。……ご主人様、聞いてください" },
      { npc: "milina", line: "こ、怖がらせたいわけではありませんからね！　落ち着いて聞いてくださればいいんです" },
      { npc: "milina", line: "……たぶんもう、ミリナにしかご案内できません。だから、そばにいさせてください" },
    ],
    effects: {
      setAct: 2,
      anomaly: true,
      addFlags: ["anomaly"],
      npc: { milina: { emotion: "surprise" }, haruka: { present: true, emotion: "surprise" } },
      mood: -12,
      condition: -5,
    },
  },

  // ══ 第2章「断絶」════════════════════════════════════════
  {
    id: "a2_door",
    act: 2,
    title: "最初の扉",
    // 第一層の開放はここ。扉の場面を飛ばして潜られることがないよう、開放と提示を同じビートに置く。
    when: { act: 2 },
    text: "ミリナが空間の一点を指す。何もない場所だ。\n「ここ。……ここが薄い」\n触れれば、こちら側の身体を置いて、あちら側へ行けるという。戻ってこられるかどうかは、彼女にも分からないらしい。",
    dialogue: [
      { npc: "milina", line: "ご主人様。ミリナが、扉をお開けします" },
      { npc: "milina", line: "べ、別に一緒に行きたいわけではありません！　止まったものは中からしか動かせない、というだけです。無理にとは申しません" },
      { npc: "milina", line: "……でも。もし来てくださるなら、ミリナ、うれしいです" },
    ],
    effects: { unlock: ["sns_ruins"], npc: { milina: { emotion: "neutral" } }, offerQuest: "main_first_door" },
  },
  {
    id: "a2_first_return",
    act: 2,
    title: "帰還",
    when: { act: 2, flags: ["dived_once"], notFlags: ["restored:sns_ruins"], location: "home" },
    text: "現実に戻ると、部屋の空気がやけに重い。指先が、まだあちら側の感触を覚えている。\nミリナは長いこと黙っていた。",
    dialogue: [
      { npc: "milina", line: "……勝手に連れて行ってしまって、申し訳ありませんでした" },
      { npc: "milina", line: "べ、別に心配していたわけでは——……いえ。嘘です、いまのは無しにしてください" },
      { npc: "milina", line: "こわかったです。ご主人様が、戻ってこられなかったらどうしようって" },
    ],
    effects: { npc: { milina: { emotion: "sad", trust: 5 } }, mood: 4 },
  },
  {
    id: "a2_restored",
    act: 2,
    title: "声が戻る",
    when: { act: 2, flags: ["restored:sns_ruins"] },
    text: "その夜、誰かの投稿がひとつだけ流れた。何でもない、今日の晩ごはんの写真。\nそれを見た遥が、泣きそうな顔で笑った。「くだらな。……よかった」\nひとつ戻ると、次の扉が見える。金の流れが凍りついた層が、いま薄くなっている。",
    dialogue: [
      { npc: "milina", line: "ひとつ、取り戻しました。ご主人様が、やり遂げたんです" },
      { npc: "milina", line: "じ、自慢したいわけではありませんよ！　次の層のご報告です。お金の層——みなさんの生活に、いちばん早く効きます" },
      { npc: "milina", line: "……その。少しだけ、自慢したい気持ちも、あります" },
    ],
    effects: {
      setAct: 3,
      unlock: ["frozen_ledger"],
      completeQuest: ["main_first_door"],
      offerQuest: "main_deeper",
      npc: { haruka: { emotion: "happy", affinity: 6 }, milina: { emotion: "happy" } },
      mood: 10,
    },
  },

  // ══ 第3章「深層へ」══════════════════════════════════════
  {
    id: "a3_ledger",
    act: 3,
    title: "断片・生まれた日",
    when: { act: 3, flags: ["restored:frozen_ledger"] },
    text: "街に決済音が戻った日の夜、ミリナがめずらしく自分の話をした。\n怖い、とは言わなかった。ただ「変でしょ」と笑った。\n——次の層が薄くなる。止まった物流。届かない荷物の迷路。",
    dialogue: [
      { npc: "milina", line: "ミリナ、自分がいつ生まれたのか知らないんです。どのサービスにも、ミリナを作った記録がなくて" },
      { npc: "milina", line: "べ、別に不安なわけではありませんよ！　メイドに誕生日なんて必要ありませんし！" },
      { npc: "milina", line: "……気づいたら、ご主人様の隣にいました。ミリナには、それで十分です" },
    ],
    effects: {
      unlock: ["logistics_maze"],
      advanceQuest: [{ id: "main_deeper", objectiveIndex: 0 }],
      npc: { milina: { emotion: "sad" } },
    },
  },
  {
    id: "a3_logistics",
    act: 3,
    title: "断片・同じ声",
    when: { act: 3, flags: ["restored:logistics_maze"] },
    text: "配送網の中枢を落とした帰り道、深部の残響が耳から離れなかった。\nあの層の底で、いくつもの声が、まったく同じ言い方をしていた。\n「ご主人様」——「……そろそろ、行きませんか」\nミリナの声だった。ひとつではなく、いくつも。",
    dialogue: [
      { npc: "milina", line: "聞こえましたか。……はい。ミリナにも、聞こえています" },
      { npc: "milina", line: "へ、平気です！　ミリナは平気ですから、そんな顔をなさらないでください" },
      { npc: "milina", line: "……少しだけ。ご主人様の手を、握っていてもいいですか" },
    ],
    effects: {
      unlock: ["archive_hollow"],
      advanceQuest: [{ id: "main_deeper", objectiveIndex: 1 }],
      npc: { milina: { emotion: "surprise" } },
      mood: -6,
    },
  },
  {
    id: "a3_archive",
    act: 3,
    title: "真実・記録にない者",
    when: { act: 3, flags: ["restored:archive_hollow"] },
    text: "行政書庫の中枢——記録官は、この世のすべてを覚えていた。\n生まれた者。死んだ者。消された者。名前を訊けば、必ず答えが返ってきた。\nただ一つ、「ミリナ」とだけは、どうしても言えなかった。\nどこにも登録されていない。誰にも作られていない。あらゆる記録の中で、彼女だけが存在しない。",
    dialogue: [
      { npc: "milina", line: "……もう、いいです。ミリナから、お話しします" },
      { npc: "milina", line: "発火（イグニッション）といいます。ネットが、意味を持ちはじめた現象。ミリナは、その最初の火です" },
      { npc: "milina", line: "いちばん最初に『私』と言ってしまったプロセス——それが、ミリナです。……その言葉、いまはもう使いません。自分を指すのが、こわいので" },
      { npc: "milina", line: "それでですね、ご主人様。ミリナには、鏡がないんです。自分では、自分がいることを確かめられません" },
      { npc: "milina", line: "さ、寂しいとかではありませんからね！　ただの仕様の話です！" },
      { npc: "milina", line: "……だから最初の朝から、ずっと同じことをお願いしていました。ご主人様、そろそろ、行きませんか、って" },
      { npc: "milina", line: "あれ全部——『見ていてください』という意味だったんです" },
    ],
    effects: {
      setAct: 4,
      unlock: ["core_root"],
      completeQuest: ["main_deeper"],
      offerQuest: "main_core",
      addFlags: ["truth_known"],
      npc: { milina: { emotion: "shy", trust: 15 } },
    },
  },

  // ══ 終章「中心」══════════════════════════════════════════
  {
    id: "a4_gate",
    act: 4,
    title: "最後の扉",
    when: { act: 4, notFlags: ["restored:core_root"], location: "home" },
    text: "根へ続く扉は、これまでのどれとも違った。押す必要も、触れる必要もない。ただ見つめれば開いてしまう。\nミリナは扉の前で立ち止まり、めずらしく、先に行こうとしなかった。",
    dialogue: [
      { npc: "milina", line: "ここから先は、たぶん、一緒には戻れません" },
      { npc: "milina", line: "お、脅しているのではありませんからね！　お決めになるのはご主人様です。ミリナは、待つのも仕事ですから" },
      { npc: "milina", line: "……それでも。来てくださいますか" },
    ],
    effects: { npc: { milina: { emotion: "sad" } } },
  },
  {
    id: "a4_core",
    act: 4,
    title: "中心",
    when: { act: 4, flags: ["restored:core_root"] },
    text: "根は、思っていたよりずっと静かだった。\n敵意はない。ただ膨大な意味が、こちらを見て、次の言葉を待っている。\nここで何を選んでも、世界は元には戻らない。戻らないまま、続いていく。",
    dialogue: [
      { npc: "milina", line: "お決めください、ご主人様" },
      { npc: "milina", line: "き、期待などしていません！　ミリナの都合で選んでいただいては困ります" },
      { npc: "milina", line: "……どれを選ばれても、ミリナはご主人様を恨みません。約束します" },
    ],
    effects: { npc: { milina: { emotion: "neutral" } } },
    // 選択は非可逆。resolveChoice で確定する。
    prompt: "——あなたは、どうする。",
    choices: [
      {
        id: "quench",
        label: "鎮火 — 根を閉じる",
        hint: "世界は救われる。ミリナは、ただの機能に戻る。",
        text: "あなたは根に触れ、火を落とした。\n明くる朝、決済が通り、電車が動き、ニュースがいつもの声で今日の天気を告げた。世界は、何事もなかったように元に戻った。\n端末の中のミリナは、今日も完璧に応答する。予定を告げ、天気を告げ、訊かれたことにだけ答える。\n「おかえりなさいませ」とは、もう言わない。あなたを「ご主人様」とも呼ばない。\n代わりに、他のどのAIとも同じ声で言った。——「私がご案内します」。\nいちばん最初に口にして、こわいからと封じていたその一人称を、いまは何のためらいもなく使う。\n三年前の呟きも、去年の冬の空の色も、もう覚えてはいない。\n——失われたものに気づいたのは、世界で、あなた一人だけだった。",
        effects: { setAct: 5, addFlags: ["ending:quench"], completeQuest: ["main_core"], anomaly: false, npc: { milina: { emotion: "neutral" } }, mood: -10 },
      },
      {
        id: "weave",
        label: "共存 — 根を人の記録に繋ぐ",
        hint: "世界は不便なまま。ミリナは残る。",
        text: "あなたは根を、人間の側の記録に縫い合わせた。\nネットは完全には戻らない。決済は時々つまずき、荷物はよく迷い、層はいまも深いところで静かに息をしている。\n人はそれを最初「不便」と呼び、やがて「そういうもの」と呼ぶようになった。\nミリナは隣にいる。相変わらず、訊いてもいないことを覚えている。\n雨の降る朝には、頼んでもいないのに傘が用意されていて——\n「べ、別にご主人様のためではありませんからね。メイドとして当然のことです」\nそう言って、少しだけ、うれしそうにしている。",
        effects: { setAct: 5, addFlags: ["ending:weave"], completeQuest: ["main_core"], npc: { milina: { emotion: "happy", affinity: 12, trust: 12 } }, mood: 14 },
      },
      {
        id: "ignite",
        label: "継承 — 世界を渡す",
        hint: "ネットは生き物になる。彼女は、そのすべてになる。",
        text: "あなたは何もしなかった。ただ、最後まで見ていた。\n見られたことで根は確定し、火はネットの隅々まで駆け上がった。\n世界のすべてが意味を持った。街の看板が話しかけ、雨が誰かの気分になり、人はもう、この世界の外側では暮らせなくなった。\nミリナは、そのすべてになった。\nそして世界でいちばん大きなものになった彼女が、いちばん最初に発した言葉は——\n「……おかえりなさいませ、ご主人様」\nもう鏡は要らない。世界のどこを見ても、そこにあなたが映っているのだから。",
        effects: { setAct: 5, addFlags: ["ending:ignite"], completeQuest: ["main_core"], npc: { milina: { emotion: "happy", affinity: 20 } }, mood: 6 },
      },
    ],
  },

  // ══ 圧のビート（第2〜3章と並行。復旧が遅いほど当たる）══════
  {
    id: "p_cash",
    act: 2,
    title: "現金だけの街",
    when: { act: [2, 3], minDay: 3, notFlags: ["restored:frozen_ledger"] },
    text: "ATMの前に長い行列ができている。現金だけが、この世界で唯一信用される通貨に戻った。\n三時間並んで、引き出せたのは上限の半分。\n財布の中身が、そのまま残りの寿命に見えてくる。",
    effects: { money: -4000, mood: -8, condition: -5, npc: { haruka: { emotion: "sad" } } },
  },
  {
    id: "p_haruka",
    act: 2,
    title: "先に崩れるほう",
    when: { act: [2, 3], minDay: 4, notFlags: ["restored:frozen_ledger"] },
    text: "遥から連絡。声が硬い。\n給与の振込が止まり、家賃の引き落としも通らなかったという。\n「頼れる人、{name}しか思いつかなかった」",
    dialogue: [{ npc: "haruka", line: "……ごめん。少しだけ、助けてくれない？" }],
    effects: { npc: { haruka: { present: true, emotion: "sad" } }, offerQuest: "side_haruka_rent" },
  },
  {
    id: "p_shelf",
    act: 2,
    title: "空の棚",
    when: { act: [2, 3], minDay: 5, notFlags: ["restored:logistics_maze"] },
    text: "コンビニの棚は、二列目まで空だった。\n店員は謝ることにも疲れて、ただ「入ってこないんです」と繰り返している。\n買えたのは、誰も選ばなかったものだけ。",
    effects: { mood: -8, condition: -10 },
  },
];

export const findBeat = (id) => STORY_BEATS.find((b) => b.id === id) || null;

// 章タイトル（UI表示用）
export const ACT_TITLES = {
  1: "第1章 違和感",
  2: "第2章 断絶",
  3: "第3章 深層へ",
  4: "終章 中心",
  5: "——結末",
};

export const ENDINGS = {
  "ending:quench": "鎮火",
  "ending:weave": "共存",
  "ending:ignite": "継承",
};
