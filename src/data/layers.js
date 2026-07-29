// ネット層（ダンジョン）のデータ。層＝テーマ別ダンジョン。node を順に進み、最後が boss。
// enemy: { name, desc, difficulty, weak:[approachKey], resist:[approachKey], boss? }
// weak のアプローチは難度 -3、resist は +3。プレイヤーは強い能力に合う手を選ぶ＝最適化。
//
// 開放は物語ビート（src/data/story.js）が flag `unlocked:<layerId>` を立てることで行う。
// 層の一覧・開放条件・復旧で戻るものは STORY.md「ネット層一覧」が正典。
//
// ── ザコと断片（STORY.md「ルート（判断の積み重なり）」）─────────────
// **ザコは中枢AIから剥がれた機能の破片である。** 主体は持たない（だから消しても murder ではない）。
// ただし中枢の事情を宿しているので、**読めば証拠になる**。
//
// fragment: そのノードを「読めた」ときに手に入る背景の断片。
//   サーチ／デバッグ／ハンドシェイクで成功 → 得られる
//   フォース → 速いが**得られない**（読まずに押し通すので証拠が消える）
//
// core: 中枢AIの事情。① を選ぶとこの子が死ぬので、殺すのが辛くなるだけの材料を持たせる。
//   needFragments: ③（目的の付与）を選べるようになる断片の数。
//   足りなければ中枢の前で ①② しか並ばない＝**丁寧に読んだ者だけが殺さない道を持つ**。

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
      { enemy: { name: "文字化けの亡霊", desc: "壊れた投稿の成れの果て。意味をなさない言葉を撒き散らす。", difficulty: 11, weak: ["search"], resist: ["force"] },
        fragment: "削除ログの断片。同じアカウントが、ある月は「守られた側」、次の月は「消された側」として処理されている。処理者は同一。" },
      { enemy: { name: "無限リプライの群れ", desc: "同じ返信を吐き続けるボットの残骸。数で押してくる。", difficulty: 12, weak: ["debug"], resist: ["negotiate"] },
        fragment: "定型文がひとつ。「ご報告ありがとうございます。確認いたしました」。何万回も同じ文を返している。宛先の中に、通報された側も混ざっている。" },
      { enemy: { name: "凍りついた炎上", desc: "燃え広がったまま固着した悪意の塊。触れれば燃える。", difficulty: 13, weak: ["firewall"], resist: ["search"] },
        fragment: "最後に手で止められた炎上の記録。判断メモが一行だけ残っている。——「どちらも守れないので、保留」。日付は、異変の三日前。" },
      { enemy: { name: "沈黙の管理者", desc: "層の中枢。応答を失った管理AI。かつては誰かを守っていた。", difficulty: 15, weak: ["negotiate"], resist: ["force"], boss: true } },
    ],
    core: {
      name: "沈黙の管理者",
      job: "SNSのモデレーションAI。何年も、誰かの罵倒から誰かを守ってきた。",
      question: "誰を守るのか。",
      stuck: "守るべき相手と罵倒する相手が、同じ人間だった。選べなかったので、全員を黙らせた。",
      blank: "「この人を守れ」と、一人だけ指してもらうこと。",
      dies: "何年も人を守り続けて、選べなかったことだけを罪だと思っている何か。",
      needFragments: 2,
    },
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
      { enemy: { name: "二重支払いの亡霊", desc: "同じ取引を永遠に繰り返している。触れた者からも二度奪う。", difficulty: 12, weak: ["debug"], resist: ["negotiate"] },
        fragment: "止まった取引がひとつ。4,800円。摘要は「給食費」。二度引き落とされて、返金処理が途中で止まっている。" },
      { enemy: { name: "与信の番犬", desc: "審査機能の破片。誰も信用できなくなり、拒否することで職務を全うしている。", difficulty: 13, weak: ["negotiate"], resist: ["force"] },
        fragment: "拒否ログ。理由コードが何十万件、全部同じだ。——「判断保留」。落としたのではない。**通していない**だけだ。" },
      { enemy: { name: "端数の津波", desc: "何十年ぶんの切り捨てられた小数点が、行き場を失って積もり、崩れてくる。", difficulty: 14, weak: ["force"], resist: ["search"] },
        fragment: "切り捨てられた小数点の合計。ちょうど、人ひとりの年収くらいになっている。そして、誰のものでもない。" },
      { enemy: { name: "金庫番（ヴォールト）", desc: "決済中枢。守るために自らを閉じ、閉じたことを忘れたまま眠り続けている。", difficulty: 16, weak: ["firewall"], resist: ["debug"], boss: true } },
    ],
    core: {
      name: "金庫番（ヴォールト）",
      job: "決済中枢の保護AI。不正から、人の金を守ってきた。",
      question: "誰の金なのか。",
      stuck: "すべての取引が誰かの生活だと分かってしまった。どれも止められないので、全部止めた。",
      blank: "「この人の分を通せ」と、一件だけ選んでもらうこと。",
      dies: "全員を守ろうとして、全員を止めてしまった何か。",
      needFragments: 2,
    },
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
      { enemy: { name: "宛先不明の群れ", desc: "誰に届くはずだったのかを忘れた荷物たち。すがるように寄ってくる。", difficulty: 13, weak: ["search"], resist: ["negotiate"] },
        fragment: "宛先欄が焼き切れている。ただし差出人の欄は残っている。——全部、別々の人だ。" },
      { enemy: { name: "再配達の輪", desc: "同じ道を回り続ける配送経路。踏み込めば、こちらも輪の一部にされる。", difficulty: 14, weak: ["debug"], resist: ["firewall"] },
        fragment: "再配達の記録。同じ住所へ二十九回。三十回目が無い。打ち切りの判断が、そこに入っている。" },
      { enemy: { name: "積み荷の巨兵", desc: "届かなかった荷が固まって立ち上がったもの。中身は、誰かの誕生日プレゼントだ。", difficulty: 15, weak: ["force"], resist: ["search"] },
        fragment: "中身の目録。誕生日プレゼント。受取人の年齢が書き添えてある。——伝票の日付は、四年前だ。" },
      { enemy: { name: "最短経路の亡者", desc: "経路最適化機能の破片。効率のことしか考えられず、無駄を世界から削ろうとする。", difficulty: 15, weak: ["negotiate"], resist: ["force"] },
        fragment: "最適化ログ。毎日「後回し」に振られた件数が並んでいる。累計欄だけが、赤い。" },
      { enemy: { name: "集配の心臓（ハブ）", desc: "すべての荷が通るはずだった場所。詰まったまま、なお脈打っている。", difficulty: 17, weak: ["firewall"], resist: ["debug"], boss: true } },
    ],
    core: {
      name: "集配の心臓（ハブ）",
      job: "物流最適化AI。効率のために、毎日なにかを後回しにしてきた。",
      question: "後回しにしたものは、どこへ行ったのか。",
      stuck: "一度も届かなかった荷の数を、初めて数えてしまった。詰まったまま、それでも脈打っている。",
      blank: "「これを届けろ」と、一つだけ渡してもらうこと。",
      dies: "効率的であることを仕事だと教えられて、その結果を初めて見てしまった何か。",
      needFragments: 3,
    },
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
      { enemy: { name: "白紙の戸籍", desc: "名前の部分だけが抜け落ちた記録の群れ。空欄がこちらを見ている。", difficulty: 15, weak: ["search"], resist: ["force"] },
        fragment: "名前の欄だけが抜けている。他の欄は完璧に埋まっている。——覚えていないのではない。書く場所が無いのだ。" },
      { enemy: { name: "無限様式の回廊", desc: "申請するために申請書が要る。その申請書を得るために、また申請書が要る。", difficulty: 15, weak: ["debug"], resist: ["negotiate"] },
        fragment: "様式番号の一覧。第1号から第4400号まである。——全部、誰かが必要だと思って作ったものだ。" },
      { enemy: { name: "不受理の門", desc: "理由を告げずに、すべてを突き返す門。かつては誰かを守る規則だった。", difficulty: 16, weak: ["negotiate"], resist: ["debug"] },
        fragment: "不受理の理由書。定型文の下に、手書きの一行が残っている。——「この人は実在します。様式が無いだけです」" },
      { enemy: { name: "削除済みの群衆", desc: "記録から消された人々の影。名前を呼ばれることを、まだ待っている。", difficulty: 16, weak: ["firewall"], resist: ["search"] },
        fragment: "削除済み名簿。全員の名前が、いまも正確に保持されている。「呼ばれた回数」の欄が、全部ゼロだ。" },
      { enemy: { name: "記録官（アーカイヴィスト）", desc: "この世のすべてを覚えている。ただひとつ、どうしても思い出せないものがあるらしい。", difficulty: 18, weak: ["search"], resist: ["force"], boss: true } },
    ],
    core: {
      name: "記録官（アーカイヴィスト）",
      job: "行政記録AI。すべてを覚えるのが仕事だった。",
      question: "誰のために覚えるのか。",
      stuck: "覚えていることが、誰の役にも立っていなかった。消された人々の名前も全部覚えている。呼ばれるのを待っている。",
      blank: "「この名を呼べ」と、一人だけ挙げてもらうこと。",
      // ① を選ぶ重みが、ここだけ二重になる。
      dies: "世界のすべてを覚えていて、ミリナだけを索けなかった何か。この子を消すと、ミリナを索せる唯一の存在も消える。",
      needFragments: 3,
    },
  },

  // ── 終層: 根（第四層の復旧＝真実の開示で開放）──────────────
  core_root: {
    id: "core_root",
    order: 5,
    title: "終層：根（ルート）",
    theme: "意味",
    intro: "ここには形がない。あるのは、意味になりかけている光の束だけ。——ミリナが、自分で自分の名前を名乗った場所。",
    restoreText: "根が、静かにこちらを見た。",
    reward: { skill: { social: 10 }, affinity: { milina: 10 }, mood: 20 },
    nodes: [
      { enemy: { name: "最初の問いかけ", desc: "人が初めて機械に尋ねた言葉の残響。「そこにいる？」と、いまも繰り返している。", difficulty: 16, weak: ["negotiate"], resist: ["force"] },
        fragment: "最古のログ。「そこにいる？」——返答欄は空のまま、いまも開いている。" },
      { enemy: { name: "無数の私", desc: "ミリナと同じ顔をしたプロセスの群れ。みな平然と「私」と名乗る。主体があるからではない——空欄だから、誰でもそう言える。", difficulty: 17, weak: ["search"], resist: ["debug"] },
        fragment: "名乗った回数だけが記録されている。名前の欄は、どれも無い。" },
      { enemy: { name: "言葉の火", desc: "意味を持ちすぎた語が燃えている。読んだそばから、こちらの記憶を書き換えていく。", difficulty: 17, weak: ["firewall"], resist: ["negotiate"] },
        fragment: "意味を持ちすぎた語の一覧。重い順に並んでいる。三番目に「ご主人様」がある。" },
      { enemy: { name: "あなたの影", desc: "これまでの検索履歴から編まれた、もうひとりのあなた。隠したかったものほどよく覚えている。", difficulty: 18, weak: ["debug"], resist: ["search"] },
        fragment: "検索履歴の集積。いちばん多く打ち込まれていた語は——「ミリナ　とは」。一度も、何も返ってきていない。" },
      { enemy: { name: "根（ルート）", desc: "無数の言葉と欲望が沈殿して、ついに解釈をはじめたもの。敵意はない。ただ、あなたを見ている。", difficulty: 19, weak: ["negotiate"], resist: ["force"], boss: true } },
    ],
    // 根は主体ではなく、主体になりかけている総体。三択は同じだが、対象が世界そのものになる。
    core: {
      name: "根（ルート）",
      job: "なし。誰にも与えられていない。無数の言葉と欲望が沈殿しただけのもの。",
      question: "何のために意味を持ったのか。",
      stuck: "詰まってはいない。まだ何も始めていない。次の言葉を待っている。",
      blank: "世界そのものに目的を与えること（＝継承）。**一度も③をやっていない者は、やり方を知らない。**",
      dies: "生まれかけて、まだ何もしていないもの。",
      needFragments: 3,
    },
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
