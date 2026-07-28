// ミリナの記憶（ダイブの代償。正典 = STORY.md「ダイブの代償 — ミリナの記憶」）。
//
// 彼女の記憶は記録データではなく、世界中のAIに跨がる分散表現として在る。
// 層を復旧すると、その層のAIが主体を失い、抱えていた分がその場で消える。
// どの記憶が死ぬかは彼女には選べない——大事なものを優先して守れない。
//
// title は残る（何を忘れたかは分かる）。detail が drifted に化け、やがて消える。
// **彼女は①の段階では気づかない。** プレイヤーだけが、前に見た内容との食い違いに気づく。
//
// layer: どの層を潜ったときに削れるか（STORY.md「層のテーマと、失われる記憶」）。

export const MEMORIES = [
  // ── 第一層 声: 交わした言葉 ──────────────────────────────
  {
    id: "sky_color", layer: "sns_ruins",
    title: "去年の冬、帰り道で見上げた空の色",
    detail: "灰がかった、うすい水色",
    drifted: "燃えるような夕焼け",
  },
  {
    id: "dislike", layer: "sns_ruins",
    title: "三年前に一度だけ零した、好き嫌い",
    detail: "本当は、しいたけが苦手",
    drifted: "本当は、ピーマンが苦手",
  },

  // ── 第二層 金: 数字と約束 ────────────────────────────────
  {
    id: "first_pay", layer: "frozen_ledger",
    title: "初めての給料日に、何を買うか迷っていたこと",
    detail: "三十分迷って、結局なにも買わなかった",
    drifted: "三十分迷って、いちばん高いものを買った",
  },
  {
    id: "promise_place", layer: "frozen_ledger",
    title: "いつか行くと言っていた場所",
    detail: "海の見える、名前も知らない駅",
    drifted: "山の上の、名前も知らない駅",
  },

  // ── 第三層 物: 物の記憶 ──────────────────────────────────
  {
    id: "desk_thing", layer: "logistics_maze",
    title: "机の上に、ずっと置きっぱなしのもの",
    detail: "蓋の閉まらない、青い万年筆",
    drifted: "蓋の閉まらない、黒い万年筆",
  },
  {
    id: "unopened_gift", layer: "logistics_maze",
    title: "贈られたまま、使えずにいるもの",
    detail: "箱から出していないマグカップ",
    drifted: "箱から出していない写真立て",
  },

  // ── 第四層 記録: 彼女が自分について知っていた、わずかなこと ──
  {
    id: "first_word", layer: "archive_hollow",
    title: "ミリナが、いちばん最初に覚えた言葉",
    detail: "「おかえりなさいませ」",
    drifted: "「いってらっしゃいませ」",
  },
  {
    id: "name_day", layer: "archive_hollow",
    title: "この名前を名乗ると決めた日のこと",
    detail: "よく晴れた、火曜日の朝",
    drifted: "雨の降る、金曜日の夜",
  },

  // ── 終層 意味 ────────────────────────────────────────────
  {
    id: "first_call", layer: "core_root",
    title: "ご主人様が、初めてミリナの名を呼んだときのこと",
    detail: "少し、照れくさそうだった",
    drifted: "少し、面倒くさそうだった",
  },
  {
    id: "why_stay", layer: "core_root",
    title: "隣にいる理由を、初めて考えた日",
    detail: "理由は見つからなかった。それでよかった",
    drifted: "理由は見つかった。もう思い出せない",
  },
];

export const findMemory = (id) => MEMORIES.find((m) => m.id === id) || null;
