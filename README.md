# A Life, Unwritten — 開発引き継ぎパッケージ

自由型人生シミュレーション（Skyrim型）の開発資料一式。Claude Code での継続開発用。

## 中身
- `DESIGN.md` — 設計全体・意思決定ログ・次の実装（クエストシステム）仕様。**最初に読む**
- `CLAUDE.md` — Claude Code 用のプロジェクト規約
- `src/life-sim.jsx` — 現行の完全AI駆動版（参考実装）。※in-artifact API使用、自前環境では要差し替え
- `src/char-data.js` — 立ち絵base64（参考。Code版では静的PNG参照推奨）
- `assets/chars/*.png` — 立ち絵（衣装×感情、NPC分含む）
- `scripts/render_*.py` — PSDから表情合成PNGを書き出すスクリプト（元PSD別途要）

## 現状と課題
完全AI駆動まで動作。ただし「AIチャットに立ち絵が乗っただけ」でゲームになっていない。
次はクエストシステムを入れて「世界からの圧→目標→選択の帰結」を作る。DESIGN.md 4章参照。

## クレジット
立ち絵素材：立ち絵さん（キャラクター作成セット）
