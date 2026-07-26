# 人生シミュレーション「A Life, Unwritten」— 設計ハンドオフ

Claude Code での継続開発用。これまでの経緯・確定した設計・次の実装（クエストシステム）をまとめる。

## 0. 物語の前提（正典）
**物語の正典は [`STORY.md`](STORY.md) を参照（必読）。** 現代日本＋異質なAI「ミリナ」＋ネットの異変
（魔物/ダンジョン/魔法・全サービス機能不全）を前提に、**現実（生活シム）↔ ネット層（ダンジョン/判定）**の
二層を往復する設計へ更新した。物語は方向と圧を与えるが強制はしない（下記コンセプト参照）。
実装は9章「物語システム」。

## 1. コンセプト

- **強い前提と方向（世界からの圧）を持ちつつ、その中をどう生きるかは自由**な人生シミュレーション。プレイヤーは「なりたいキャラ」で行動し、世界がフレキシブルに反応する。
- 起点は「現代日本の平凡な朝」。ミリナの異質さ→ネットの異変を経て、現実とネット層を往復する冒険へ。
- 目標とする手応えは **Skyrim 型**。世界からの圧（イベント遭遇）→ クエスト提示 → 受注/拒否/放置がプレイヤー次第。メインを無視して生活しても世界は回る。

## 2. これまでの意思決定ログ

| 論点 | 決定 |
|---|---|
| アーキテクチャ | A(AI駆動)+B(ルールベース)のハイブリッド。KMixerOrigin の4層発想を流用 |
| グラフィック | コード手打ちドット絵は品質不足で断念 → 既存無料素材「立ち絵さん」を採用 |
| キャラ調達 | 「立ち絵さん」PSD素材（29衣装、表情パーツ多数）。ライセンス: 営利商用可・非申告・クレジット任意（可能なら「立ち絵さん」表記） |
| 表情 | 気分連動型。目/口/眉/頬レイヤーを感情プリセットで合成しPNG書き出し。6感情(neutral/happy/angry/sad/shy/surprise) |
| キャラメイク | 統一ステータス。AIが質問して回答から初期値変換（現状は固定4問の選択式） |
| NPC | プレイヤーと並べて表示。AIが感情・発話・新登場を返す |
| AI | 完全AI駆動。毎ターン world state + 行動を渡し構造化JSONを得る |
| **現状の課題** | **AIチャットに立ち絵が乗っただけで「ゲーム」になっていない。目標/抵抗/非可逆性/最適化余地/世界からの圧が欠如** |

## 3. 確定アーキテクチャ（4層）

- **L1 World State**: 確定事実を JSON で一元管理（決定論的、コード側）。時刻/場所/所持金/プレイヤー/NPC/フラグ/クエスト。
- **L2 Fact Verification**: AI が返した差分を World State と突き合わせ検証。不整合（死亡NPCへの好感度変化、残高不足、重複ID）を却下。
- **L3 Narrative / World Ops**: Anthropic API。**今後「描写」から「世界運営」へ格上げ**（下記4章）。構造化JSON出力。
- **L4 Direction / Pacing**: 収束を作る層。クエスト提示のタイミング制御、放置ペナルティ、締切管理。

## 4. クエストシステム（実装済み）

「チャット→ゲーム」への転換点。クエストという**離散的な状態を持つ構造体**を世界に導入する。

### 4.1 クエストのデータ構造
```
Quest {
  id: string
  title: string
  giverNpcId: string | null      // 依頼主
  description: string
  objectives: [{ text, done: bool }]
  status: "offered" | "active" | "completed" | "failed" | "declined"
  deadline: { day, hour } | null  // 締切。過ぎると failed
  progress: 0..100
  reward: { money?, affinity?: {npcId:delta}, skill?: {name:delta}, item? }
  createdAt: {day,hour}
}
```

### 4.2 ループ
1. **発生（L4判断）**: 世界イベント（時間経過・場所移動・NPC遭遇）を契機に、AIが「今クエストを提示すべきか」を判断。適切ならクエストを `offered` で生成。
2. **受注/拒否**: プレイヤーが offered を見て受ける→`active` / 断る→`declined`。**強制しない**。
3. **進行**: active クエストは、プレイヤー行動がその objective に関係するかを毎ターンAIが判定し progress を更新。
4. **放置の帰結（世界からの圧）**: deadline 経過で `failed`。失敗は giverNpc の好感度低下やフラグとして残る（非可逆性）。
5. **達成**: 全 objective done で `completed`。reward を L2 経由で適用。

### 4.3 AI（L3）の二重の仕事
毎ターンの出力JSONに、従来の narration/diff に加えて **quest 運営フィールド**を持たせる：
```
{
  "narration": "...",
  "diff": {...},                    // 既存
  "playerEmotion": "...", "npcEmotions": {...}, "dialogue": {...},  // 既存
  "questOps": {
    "offer":   [{ Quest構造(status除く) }],     // 新規提示
    "advance": [{ questId, objectiveIndex, done, progressDelta }], // 進行
    "complete":[questId],
    "fail":    [questId]
  }
}
```
L2 でこれを検証してから World State のクエスト配列に反映する。offer が乱発されないよう L4 で「active クエスト数上限」「クールダウン」を課す。

### 4.4 UI 追加
- クエストログ（offered/active/completed のタブ）
- offered には「受ける／断る」ボタン
- active には objective チェックリストと締切表示

## 5. スキル成長・蓄積（並行で入れる手応えの土台）

- 行動にタグ（combat/social/craft/study/physical...）。行動タグに応じて対応スキルが微増。
- スキル値はクエスト objective の成否判定に効く（AIプロンプトにスキル値を渡し、難易度と照合させる）。
- 実績（フラグの一種）: 「初めて〜した」等を記録し、蓄積の可視化に使う。

## 6. 技術メモ / 落とし穴

- **AI呼び出し先**: 現行アーティファクトは Anthropic の in-artifact API（キー不要・claude-sonnet-4-6）を使用。**Claude Code / 自前環境ではこれは使えない**。`ANTHROPIC_API_KEY` を .env に置き、公式 SDK 経由で呼ぶ実装に差し替える。関数 `aiEngine()` がその境界。
- **状態の永続化**: 現行はリロードで消える。Claude Code 版では localStorage かファイル保存（Electron等）かサーバDBを検討。セーブ/ロードは Skyrim 型に必須。
- **立ち絵アセット**: `assets/chars/` に衣装×感情のPNG。現行はbase64埋め込みだが、Code版では静的ファイル参照に戻すのが軽い。書き出しスクリプト `render_all.py` / `render_npc.py` を同梱。
- **表情マッピング**: `EMOTIONS` 辞書（目/口/眉/頬のレイヤー名対応）。感情を増やすならここを拡張し再書き出し。
- **整合性ガードは AI の暴走対策の要**。自由型は L2 がないと必ず破綻する。offer/advance も必ず L2 を通す。

## 7. 推奨ディレクトリ構成（Code版）
```
/src
  /engine
    worldState.js      // L1: 初期化・型
    verify.js          // L2: 整合性ガード（diff/questOps適用）
    aiEngine.js        // L3: API呼び出し・プロンプト構築
    pacing.js          // L4: クエスト提示判断・締切・クールダウン
    story.js           // L4: 物語ビートの判定・適用・結末の選択（決定論）
    quests.js          // クエスト状態機械
    skills.js          // スキル成長
    dungeon.js         // ネット層の状態機械（ダイブ・ノード進行・遭遇解決）
    checks.js          // スキル判定（能力＋スキル＋ダイス vs 難度）
  /ui
    Scene.jsx          // 背景＋立ち絵並列
    QuestLog.jsx
    StatusBar.jsx
    ActionInput.jsx
    NetPanel.jsx       // ネット層の遭遇UI
    StoryChoice.jsx    // 終章の分岐・結末表示
  /data
    creationQuestions.js
    story.js           // 物語ビート（正典 STORY.md と対応）
    layers.js          // ネット層のデータ（全5層）
  /assets
    /chars *.png
/scripts
  render_all.py
  render_npc.py
.env  (ANTHROPIC_API_KEY)
```

## 8. モデル選択メモ
- 世界運営の毎ターン生成は速度重視で Sonnet 系が現実的。重要局面（大型クエスト分岐）のみ上位モデル、という二段構えも可。
- 構造化JSON出力の安定性が肝。プロンプトで「JSONのみ・コードフェンス禁止」を厳守させ、パース失敗時リトライを実装。

## 9. 物語システム（実装済み）

物語を「読み物」ではなく **World State を動かす離散的な状態機械** として実装した。
正典 `STORY.md` → データ `src/data/story.js` → 進行 `src/engine/story.js`。

### 9.1 なぜ決定論なのか
自由型シムでAIに物語の骨（章・伏線・真実・結末）を書かせると、必ず前後関係が壊れる
（真実を早漏れさせる／同じ告白を二度する／未到達の層を語る）。L2は事実の矛盾は弾けるが、
**物語の順序は弾けない**。そこで骨はコード側に置き、AIには枝葉だけを任せる。

- **骨（決定論）**: 章の進行、ネット層の開放、メインクエストの発行と締め、真実の開示、結末の分岐
- **枝葉（AI/L3）**: 日々の行動への反応、サイドクエスト、NPCとの会話、異変下の生活の手触り

### 9.2 ビート
```
Beat {
  id, act, title,
  when:    { act, minTurn, minDay, beats[], flags[], notFlags[], location }  // 既定は地上のみ
  effects: { setAct, anomaly, unlock[], addFlags[], mood, condition, money,
             npc:{id:{present,emotion,affinity,trust}},
             offerQuest, advanceQuest[], completeQuest[] }
  text, dialogue[], choices[]   // choices を持つビートは選択待ちで世界を止める
}
```
- 発火は **1ターン1件**（詰め込まない）。発火済みIDは `world.story.beats` に残り、二度は起きない＝非可逆。
- 層の復旧直後だけ `max:2` で呼び、その場で章が動く（プレイヤーの達成感と同じターンに反応を返す）。
- クエスト操作は必ず `quests.js` の状態機械と `verify.applyReward` を経由する（報酬の入口を一本化）。
- 拒否/失敗済みのクエストには手を出さない＝プレイヤーの選択は世界に残り続ける。

### 9.3 メインクエストと提示枠
物語が発行するクエストは `main:true`。L4 の提示上限（`openSideQuests`）に数えないので、
メインが枠を食ってサイドが出なくなることがない。**AIの offer は verify 側で必ず `main:false` に落とす**
（AIが `main` を騙って上限を迂回するのを防ぐ）。

### 9.4 進行のゲート
ネット層は `unlocked:<layerId>` フラグが立つまで潜れない（`dungeon.startDive` が拒否）。
開放フラグを立てるのはビートだけなので、**物語より先へは進めない**。逆に復旧（`restored:<layerId>`）が
次のビートの条件になっており、「潜る→世界が少し戻る→章が進む→次の層が開く」が閉じたループになる。

### 9.5 圧と結末
- 圧のビート（`p_cash`/`p_haruka`/`p_shelf`）は、復旧が遅いほど日数条件で当たる。所持金・気分・体力を削り、
  遥からは締切つきのサイドクエストが来る。放置すれば失敗として好感度とフラグに残る。
- 終章の選択は3つ（鎮火/共存/継承）。すべて非可逆で、どれも「正解」ではない。
  結末後も世界は回り続ける（UIは結末を掲示するが、行動は止めない）。
