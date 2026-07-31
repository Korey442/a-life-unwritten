// 決定論モックエンジン。ANTHROPIC_API_KEY が無くてもゲームが成立するためのフォールバック。
// AIの代わりにルールベースで world state を読み、questOps を含む応答を返す。
import { active, offered } from "./quests.js";
import { offerPolicy } from "./pacing.js";
import { normalizeTags } from "./skills.js";

// 行動キーワード → タグ・気分/体調の傾向
const KEYWORDS = [
  { re: /(働|仕事|バイト|稼)/, tags: ["study"], mood: -3, condition: -6, money: 4000, narr: "しばらく働いた。疲れはあるが、いくらかの収入になった。" },
  { re: /(食|飯|ごはん|ランチ|食事)/, tags: [], mood: 5, condition: 8, money: -900, narr: "食事をとった。少し気分が落ち着いた。" },
  { re: /(休|寝|眠|昼寝)/, tags: [], mood: 6, condition: 14, narr: "身体を休めた。頭が軽くなった気がする。" },
  { re: /(運動|走|鍛|トレ|筋)/, tags: ["physical"], mood: 4, condition: -4, narr: "身体を動かした。心地よい疲労が残る。" },
  { re: /(作|造|料理|工作|描|書)/, tags: ["craft"], mood: 3, narr: "手を動かして何かを作った。" },
  { re: /(戦|殴|倒|退治)/, tags: ["combat"], mood: 2, condition: -8, narr: "ひと悶着あった。無事では済まないが、切り抜けた。" },
  { re: /(話|会|相談|挨拶|声をかけ)/, tags: ["social"], mood: 4, narr: "言葉を交わした。距離が少し縮まった気がする。" },
];

// モックが出すサイドクエストのテンプレ（順番に提示）。章に合わせて出し分ける。
// メインクエスト（物語の背骨）は data/story.js が発行するので、ここでは扱わない。
const QUEST_TEMPLATES = {
  // 平時（第1章）: 日常の頼まれごと。異変の予兆までは匂わせる。
  calm: [
    { title: "接続の不調", giverNpcId: null, description: "いつものサービスが妙に重い。街でも“繋がらない”という声が増えている。", objectives: ["不調の範囲を調べる", "原因の手がかりを掴む"], deadlineHours: 24, reward: { money: 800, skill: { study: 4 } } },
    { title: "弾かれた決済", giverNpcId: null, description: "レジで二度続けて弾かれた。店員も原因が分からないという。", objectives: ["別の支払い手段を探す", "買い物を済ませる"], deadlineHours: 12, reward: { money: 600, skill: { social: 4 } } },
    { title: "掲示板の悲鳴", giverNpcId: null, description: "ネットの片隅に、助けを求める断片的な書き込み。誰か——あるいは何かが、困っている。", objectives: ["書き込みの主を追う", "正体に触れる"], deadlineHours: 12, reward: { money: 1500, skill: { craft: 4 } } },
  ],
  // 異変後: 生活そのものが依頼になる。
  anomaly: [
    { title: "現金をつくる", giverNpcId: null, description: "電子決済は死んだ。手元の現金だけが今日を食いつなぐ手段になる。", objectives: ["現金を手に入れる手段を探す", "実際に工面する"], deadlineHours: 20, reward: { money: 5000, skill: { craft: 5 } } },
    { title: "隣の部屋", giverNpcId: null, description: "隣人の物音が二日ばかり聞こえない。放っておくこともできる。", objectives: ["様子を見に行く", "無事を確かめる"], deadlineHours: 16, reward: { mood: 8, skill: { social: 6 } } },
    { title: "水と灯り", giverNpcId: null, description: "物流が止まり、当たり前だったものが当たり前でなくなった。備えが要る。", objectives: ["水を確保する", "明かりを確保する"], deadlineHours: 28, reward: { money: 1200, skill: { physical: 6 } } },
  ],
};

function pickKeyword(action) {
  return KEYWORDS.find((k) => k.re.test(action)) || null;
}

export function mockAiCall(world, action) {
  const kw = pickKeyword(action);
  const res = {
    narration: kw ? kw.narr : `${world.player.name}は「${action}」を試みた。世界は静かに反応した。`,
    diff: { advanceMin: 45 },
    actionTags: normalizeTags(kw?.tags || []),
    playerEmotion: kw && kw.mood > 4 ? "happy" : "neutral",
    npcEmotions: {},
    questOps: { offer: [], advance: [], complete: [], fail: [] },
  };
  if (kw) {
    if (kw.mood) res.diff.mood = kw.mood;
    if (kw.condition) res.diff.condition = kw.condition;
    if (kw.money) res.diff.money = kw.money;
  }

  // 受注中クエスト: 行動が関連しそうなら先頭の未達成 objective を進める
  const act = active(world);
  if (act.length) {
    const q = act[0];
    const idx = q.objectives.findIndex((o) => !o.done);
    if (idx >= 0 && (kw || /進|行|探|解決|買|向か|達成/.test(action))) {
      const willFinish = idx === q.objectives.length - 1;
      res.questOps.advance.push({ questId: q.id, objectiveIndex: idx, done: true, progressDelta: 30 });
      if (willFinish) res.questOps.complete.push(q.id);
      res.narration += ` 「${q.title}」が前に進んだ。`;
    }
  }

  // 新クエスト提示: L4が許すターンで、依頼主の好感度に応じて出す
  const policy = offerPolicy(world);
  if (policy.allowed && offered(world).length === 0) {
    const turn = world.pacing?.turn ?? 0;
    // 数ターンに一度、テンプレを順に提示
    if (turn % 3 === 0) {
      const pool = world.story?.anomaly ? QUEST_TEMPLATES.anomaly : QUEST_TEMPLATES.calm;
      const tmpl = pool[(Math.floor(turn / 3)) % pool.length];
      const dl = advanceHours(world.time, tmpl.deadlineHours);
      res.questOps.offer.push({
        title: tmpl.title, giverNpcId: tmpl.giverNpcId, description: tmpl.description,
        objectives: tmpl.objectives, deadline: { day: dl.day, hour: dl.hour }, reward: tmpl.reward,
      });
      if (tmpl.giverNpcId && world.npcs[tmpl.giverNpcId]) {
        res.dialogue = { [tmpl.giverNpcId]: "ねえ、ちょっとお願いしてもいい？" };
        res.npcEmotions[tmpl.giverNpcId] = "happy";
      }
    }
  }
  return res;
}

function advanceHours(t, hours) {
  const total = t.hour + hours;
  return { day: t.day + Math.floor(total / 24), hour: total % 24 };
}
