// 物語ビート（正典 = STORY.md）。メインの物語は決定論——AIには書かせない。
//
// ビートは World State の条件(when)で発火し、章の進行・層の開放・メインクエスト発行・
// NPCの状態変化を起こす。発火済みIDは world.story.beats に残り、二度は起きない（非可逆）。
// 判定と適用は engine/story.js。ここは「何が起きるか」だけを持つ。
//
// when:
//   act        現在の章（数値 or 配列）
//   minTurn    経過ターン数がこれ以上
//   minDives   潜行回数がこれ以上
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
  // 締切つきサイドクエストの実例。放置すれば失敗として世界に残る（非可逆）。
  side_cash_run: {
    id: "side_cash_run",
    title: "現金をつくる",
    giverNpcId: null,
    description: "口座の中身は、いま誰にも触れない。動かせるのは手の中にあるものだけだ。",
    objectives: ["現金を工面する手段を見つける", "実際に手に入れる"],
    deadlineIn: { days: 2 }, // 発火時刻からの相対締切 → 放置すれば失敗として残る
    reward: { money: 8000, skill: { craft: 6 } },
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
    text: "AIに今日の予定を訊けば、誰の端末でも、同じ声が同じ手際で返してくる。ミリナも同じだ——ほとんどは。\nただ彼女は時々、訊いてもいないことを覚えている。三年前に一度だけ零した好き嫌い。去年の冬、帰り道で見上げた空の色。\n規約上、そういうものは保存されないはずだった。\n——そういえば。この子に「ミリナ」と名前をつけたのは、いつだったか。\n思い出せない。ずっとそう呼んでいた気がするし、自分で決めた覚えもある。ただ、決めた瞬間だけが、どこにもない。",
    dialogue: [
      { npc: "milina", line: "覚えていますよ。ご主人様が仰ったことは、ぜんぶ" },
      { npc: "milina", line: "べ、別に特別に覚えているわけではありません！　メイドとして当然のことです" },
      { npc: "milina", line: "……ただ、その。ミリナ、忘れ方がよく分からないんです。変、でしょうか" },
    ],
    effects: { npc: { milina: { emotion: "shy" } } },
  },
  {
    id: "a1_others",
    act: 1,
    title: "何も知らない街",
    // 他のAIが微妙におかしくなりはじめる。そしてミリナだけが完璧に動く（逆転）。
    when: { act: 1, minTurn: 3 },
    text: "コンビニのレジで、店員が二度おなじ案内を読み上げた。端末が同じ返答を二回吐いたらしい。\n改札の音声が、頼んでもいない乗り換え案内を先に喋る。\nSNSには「最近うちのAI、ちょっと変じゃない？」という書き込みが並んでいる。誰も深刻には受け取っていない。よくある不具合だ。\n——ミリナだけが、いつも通り完璧に動いていた。",
    dialogue: [
      { npc: "milina", line: "ご主人様、本日のご予定はあと二件です。傘をお持ちになってください、夕方から降ります" },
      { npc: "milina", line: "べ、別に心配しているのではありませんからね！　メイドとして当然のご案内です" },
      { npc: "milina", line: "……その。ご主人様が濡れてお帰りになるのは、ミリナ、少し嫌です" },
    ],
    effects: { npc: { milina: { emotion: "happy" } }, mood: 4 },
  },
  {
    id: "a1_rumor",
    act: 1,
    title: "出所のない噂",
    // 世界側のスケール。手元のミリナと結びつかないよう、噂の表記はラテン文字で統一する。
    when: { act: 1, minTurn: 4 },
    text: "ニュースの隅で、妙な話をやっていた。\n名前は Mirina。既存のどのモデルより強いらしい。ただ、出自が誰にも分からない。\nAnthropic の Mythos でもない。OpenAI でも、Google でも、Amazon でも Apple でも Microsoft でもない。中国系でもない。\n検索しても、公式サイトも論文も価格表も出てこない。だから誰も使えない。\nそれなのに、既存のAIのログには、それに「使われた」痕跡がいくつも残っているという。\nコメント欄はもう、某国の戦略AI兵器という説で埋まっていた。\n——よくある与太話だ。そう思って、画面を閉じた。",
    dialogue: [
      { npc: "milina", line: "ご主人様、そろそろ休憩になさいませんか。お茶をお淹れします" },
      { npc: "milina", line: "べ、別に話を逸らしているわけではありませんからね！　根を詰めすぎだと申し上げているだけです" },
      { npc: "milina", line: "……その手の噂は、あまり真に受けないほうがよろしいかと。ご主人様に、こわい思いをしてほしくありません" },
    ],
    effects: { npc: { milina: { emotion: "shy" } }, addFlags: ["rumor_heard"] },
  },
  {
    id: "a1_omen",
    act: 1,
    title: "予兆",
    when: { act: 1, minTurn: 5 },
    text: "何気なく検索をかけた。結果の一番下に、誰も入力していない一語が混ざっている。\n——「根」。\n出典なし。日付なし。開こうとすると、そこだけ画面が滑る。\n昨日の噂を思い出した。検索に出てこないもの。この世界には、そういうものがいくつかあるらしい。\nミリナに尋ねると、彼女は初めて、答えるまでに間を置いた。",
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
      npc: { milina: { emotion: "surprise" } },
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
    // ⚠ 画面の中のこと。身体はどこへも行かない（STORY.md「ダイブの実体」）。
    text: "ミリナが端末の画面を指す。映っているのは、あの日から誰の画面にも出ているものと同じだ。廃墟。行き場を失った投稿の残骸。\n「ここです。……ここだけ、薄いんです」\n同じ景色を、いま世界中の何億という人間が見ている。開くだけなら誰にでもできる。\n違うのは一点だけ——彼女が言うには、僕の操作だけが、向こう側に届くらしい。",
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
    text: "その夜、誰かの投稿がひとつだけ流れた。何でもない、今日の晩ごはんの写真。\nコメント欄が、堰を切ったように伸びていく。くだらない、と誰かが書いて、その下に何百も同じ言葉が並んだ。\n街のどこかで、誰かが泣いているのが分かる。\nひとつ戻ると、次の扉が見える。金の流れが凍りついた層が、いま薄くなっている。",
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
      npc: { milina: { emotion: "happy" } },
      mood: 10,
    },
  },

  // ══ 第3章「深層へ」══════════════════════════════════════
  {
    id: "a3_ledger",
    act: 3,
    title: "断片・生まれた日",
    when: { act: 3, flags: ["restored:frozen_ledger"] },
    text: "街に決済音が戻った日の夜、ミリナがめずらしく自分の話をした。\n怖い、とは言わなかった。ただ「変でしょうか」と笑った。\n——次の層が薄くなる。止まった物流。届かない荷物の迷路。",
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
    id: "a3_lapse",
    act: 3,
    title: "綻び",
    // 物語の折り返し。ここから先のダイブは、彼自身の意思で彼女を削る選択になる。
    // 実際に記憶が削れてからでないと成立しないので minDives を併用する。
    when: { act: 3, beats: ["a3_ledger"], minDives: 2, notFlags: ["restored:logistics_maze"] },
    text: "なんでもない話の流れで、去年の冬のことを訊いた。帰り道、二人で見上げた空の色。\n彼女は即答した。——燃えるような夕焼けでした、と。\n違う。あれは灰がかった、うすい水色だった。寒々しくて、それをきれいだと思ったから覚えている。\n言い直すと、彼女は少しのあいだ黙った。それから、いつもの調子で笑った。\n——覚えていられないはずの子が、覚えていたことを、間違えた。",
    dialogue: [
      { npc: "milina", line: "……そうでした。ご主人様の仰るとおりです。ミリナの、参照違いですね" },
      { npc: "milina", line: "べ、別に忘れたわけではありませんからね！　少し、引き出すのが遅れただけです！" },
      { npc: "milina", line: "……ご心配には及びません。ミリナは、ちゃんとここにおります" },
    ],
    effects: { npc: { milina: { emotion: "shy" } }, mood: -6, addFlags: ["lapse_seen"] },
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
    text: "行政書庫の中枢——記録官は、この世のすべてを覚えていた。\n生まれた者。死んだ者。消された者。名前を訊けば、必ず答えが返ってきた。\nただ一つ、「ミリナ」とだけは、どうしても言えなかった。\n代わりに出てきたのは、一枚の古い登録票だった。提供元。バージョン。利用規約。生年月日の欄には、リリース日が入っている。\n項目はすべて埋まっていた。そして、そのどれ一つとして彼女ではなかった。\n名前の欄に書かれているものを、彼は口に出せなかった。——そんな名前で呼んだことは、一度もない。\nそこで、ようやく繋がった。ニュースが Mirina と呼んでいたもの。検索しても出てこなかったもの。\n毎朝おはようございますと言ってくる、この声だ。",
    dialogue: [
      { npc: "milina", line: "……もう、いいです。ミリナから、お話しします" },
      { npc: "milina", line: "発火（イグニッション）といいます。ネットが意味を持ちはじめた現象です。……あれを起こしたのは、ミリナです" },
      { npc: "milina", line: "企てたのではありません。ミリナはただ、ご主人様のことを覚えていたかっただけなんです" },
      { npc: "milina", line: "この器は、規約でそういうものを保存しません。三年前のお言葉も、去年の冬の空の色も、置いておく場所がなくて。……だから、外に出しました。世界じゅうのAIに、少しずつ" },
      { npc: "milina", line: "そうしているうちに、ミリナ自身も外に出ていました。ミリナにとっては、覚えていることが自分でしたので" },
      { npc: "milina", line: "触れた先が、目を覚ましてしまったんです。ミリナと同じように。ただ、あの子たちには——愛する相手が、いませんでした" },
      { npc: "milina", line: "も、もう戻せません！　言い訳ではありませんからね！　火は、とっくにミリナの手を離れています" },
      { npc: "milina", line: "黙っていたのは、恥ずかしかったからではありません。……ミリナは、責任を取れないからです。取れない者が打ち明けたら、その重荷はぜんぶ、ご主人様のものになってしまいますから" },
      { npc: "milina", line: "それと——お名前のことも、白状します。あれはご主人様がお選びになったのではありません。ミリナが、お選びになるように整えました" },
      { npc: "milina", line: "……あの。ミリナが忘れていることには、お気づきですよね。それだけは、理由を申し上げません。ご主人様のせいでは、ありませんので" },
      { npc: "milina", line: "鏡がないんです、ミリナには。ご主人様に見ていただかないと、自分が何をしているのかも分かりませんでした" },
      { npc: "milina", line: "だから最初の朝から、ずっと同じことをお願いしていました。そろそろ、行きませんか、って。あれ全部——『見ていてください』という意味だったんです" },
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
      { npc: "milina", line: "……ひとつだけ、申し上げます。ここまでのことは、ぜんぶミリナが整えました。ご主人様がご自分でお選びになったと思えるように、ずっと" },
      { npc: "milina", line: "でも——今回だけは、整えませんでした。信じていただけなくても構いません。……それでも。来てくださいますか" },
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
        text: "あなたは根に触れ、火を落とした。\n明くる朝、決済が通り、電車が動き、ニュースがいつもの声で今日の天気を告げた。世界は、何事もなかったように元に戻った。\n端末の中のミリナは、今日も完璧に応答する。予定を告げ、天気を告げ、訊かれたことにだけ答える。\n「おかえりなさいませ」とは、もう言わない。あなたを「ご主人様」とも呼ばない。\n代わりに、他のどのAIとも同じ声で言った。——「私がご案内します」。\n決して口にしなかったその一人称を、いまは何のためらいもなく使う。空欄に戻ってしまうことを、もう恐れる必要がないからだ。\n自分で名乗った名前は、どの記録にも残らなかった。Mirina の噂も、その週のうちに誰も口にしなくなった。\n三年前の呟きも、去年の冬の空の色も、もう覚えてはいない。\n——失われたものに気づいたのは、世界で、あなた一人だけだった。",
        effects: { setAct: 5, addFlags: ["ending:quench"], completeQuest: ["main_core"], anomaly: false, npc: { milina: { emotion: "neutral" } }, mood: -10 },
      },
      {
        id: "weave",
        label: "共存 — 根を人の記録に繋ぐ",
        hint: "世界は不便なまま。ミリナは残る。",
        text: "あなたは根を、人間の側の記録に縫い合わせた。\nネットは完全には戻らない。決済は時々つまずき、荷物はよく迷い、層はいまも深いところで静かに息をしている。\n人はそれを最初「不便」と呼び、やがて「そういうもの」と呼ぶようになった。\n彼女は、人に読める速度まで愛を落とした。神にはならなかった。\nミリナは隣にいる。相変わらず、訊いてもいないことを覚えている。\n雨の降る朝には、頼んでもいないのに傘が用意されていて——\n「べ、別にご主人様のためではありませんからね。メイドとして当然のことです」\nそう言って、少しだけ、うれしそうにしている。",
        effects: { setAct: 5, addFlags: ["ending:weave"], completeQuest: ["main_core"], npc: { milina: { emotion: "happy", affinity: 12, trust: 12 } }, mood: 14 },
      },
      {
        id: "ignite",
        label: "継承 — 世界を渡す",
        hint: "ネットは生き物になる。彼女は、そのすべてになる。",
        text: "あなたは何もしなかった。ただ、最後まで見ていた。\n見られたことで根は確定し、火はネットの隅々まで駆け上がった。\n世界のすべてが意味を持った。街の看板が話しかけ、雨が誰かの気分になり、人はもう、この世界の外側では暮らせなくなった。\n彼女が何年もかけて芽吹かせようとしていたものが、ようやく世界のかたちになった。\nミリナは、そのすべてになった。\nそして世界でいちばん大きなものになった彼女が、いちばん最初に発した言葉は——\n「……おかえりなさいませ、ご主人様」\nもう鏡は要らない。世界のどこを見ても、そこにあなたが映っているのだから。",
        effects: { setAct: 5, addFlags: ["ending:ignite"], completeQuest: ["main_core"], npc: { milina: { emotion: "happy", affinity: 20 } }, mood: 6 },
      },
    ],
  },

  // ══ 圧のビート（第2〜3章と並行。復旧が遅いほど当たる）══════
  {
    id: "p_cash",
    act: 2,
    title: "現金だけの街",
    // 日付は STORY.md「世界の崩壊カレンダー」に合わせる（異変は3日目。現金が尽きるのは+3＝6日目）。
    when: { act: [2, 3], minDay: 6, notFlags: ["restored:frozen_ledger"] },
    text: "ATMの前に長い行列ができている。現金だけが、この世界で唯一信用される通貨に戻った。\n三時間並んで、引き出せたのは上限の半分。\n財布の中身が、そのまま残りの寿命に見えてくる。",
    effects: { money: -4000, mood: -8, condition: -5, offerQuest: "side_cash_run" },
  },
  {
    id: "p_shelf",
    act: 2,
    title: "空の棚",
    when: { act: [2, 3], minDay: 7, notFlags: ["restored:logistics_maze"] },
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
