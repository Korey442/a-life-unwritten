# A Life, Unwritten — 開発引き継ぎパッケージ

自由型人生シミュレーション（Skyrim型）の開発資料一式。Claude Code での継続開発用。

## 中身
- `DESIGN.md` — 設計全体・意思決定ログ・次の実装（クエストシステム）仕様。**最初に読む**
- `CLAUDE.md` — Claude Code 用のプロジェクト規約
- `src/life-sim.jsx` — 現行の完全AI駆動版（参考実装）。※in-artifact API使用、自前環境では要差し替え
- `src/char-data.js` — 立ち絵base64（参考。Code版では静的PNG参照推奨）
- `assets/chars/*.png` — 立ち絵（衣装×感情、NPC分含む）
- `scripts/render_*.py` — PSDから表情合成PNGを書き出すスクリプト（元PSD別途要）

## 現状
クエストシステム（DESIGN.md 4章）を実装し、「チャット→ゲーム」への転換点を通過。
4層アーキテクチャ（L1 World State / L2 整合性ガード / L3 世界運営 / L4 ペーシング）を
純ESMモジュールとして構築し、クエストの状態機械（発生→受注/拒否→進行→放置の帰結→達成）が動作する。

- L1 `src/engine/worldState.js` — 確定事実のJSON（quests/skills/pacingメタ含む）
- L2 `src/engine/verify.js` — diff/questOps を World State と突き合わせ検証してから適用
- L3 `src/engine/aiEngine.js`＋`prompt.js` — 公式SDK経由（`ANTHROPIC_API_KEY`）。無ければ決定論モック
- L4 `src/engine/pacing.js` — 提示上限・クールダウン・締切処理（放置の帰結）
- `src/engine/quests.js` — クエスト状態機械 / `skills.js` — スキル成長
- UI `src/ui/*` は World State を読むだけ。クエストログ（受ける/断る・目標・締切）を追加

## 動かし方
```bash
npm install
cp .env.example .env        # ANTHROPIC_API_KEY を入れる（無くてもモックで動く）
npm run server              # 別ターミナル: L3 APIサーバ (:8787)
npm run dev                 # Vite dev server。ブラウザで開く
npm test                   # engine のユニットテスト（クエスト全ライフサイクル）
npm run build              # 本番ビルド
```
`ANTHROPIC_API_KEY` 未設定でもモックエンジンでクエスト提示〜達成まで一通り遊べる。
キーを入れると L3 が公式SDK経由で世界を運営する。

## 参考実装（superseded）
- `src/life-sim.jsx` / `src/char-data.js` — 旧・完全AI駆動の単一ファイル版（in-artifact API使用）。
  上記4層構成に再実装済み。設計の参照用に残置。

## クレジット
立ち絵素材：立ち絵さん（キャラクター作成セット）
