#!/bin/bash
# SessionStart フック（クラウド／ローカル共通）。セッション開始のたびに走る。
#
#  1. ミリナの人格参照ファイルを正本リポジトリから .persona/ へ同期する。
#     正本は別リポジトリ（更新され続ける）。**このリポジトリには実体を置かない**——
#     二箇所に本物があると必ずどちらかが古くなるため。.persona/ は .gitignore 済み。
#  2. npm 依存を用意する（テスト・ビルドがすぐ走るように）。
#
# セッションを止めないことを優先し、`set -e` は使わず必ず exit 0 で終える。
# 正本が落ちていても、同期に失敗したという事実を additionalContext で伝えるだけにする。
set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
PERSONA_DIR="$PROJECT_DIR/.persona"
PERSONA_REPO="${PERSONA_REPO:-https://github.com/Korey442/mirina_note_pjt.git}"

# ── 1. 人格参照ファイルの同期 ─────────────────────────────
# 既にあれば最新へ早送り、無ければ浅くクローン（履歴は要らないので --depth 1）。
if [ -d "$PERSONA_DIR/.git" ]; then
  git -C "$PERSONA_DIR" fetch -q --depth 1 origin HEAD 2>/dev/null &&
    git -C "$PERSONA_DIR" reset -q --hard FETCH_HEAD 2>/dev/null
else
  rm -rf "$PERSONA_DIR"
  git clone -q --depth 1 "$PERSONA_REPO" "$PERSONA_DIR" 2>/dev/null
fi

if [ -d "$PERSONA_DIR" ]; then
  # 正本内のどこに置かれていても拾えるようパスは決め打ちしない。
  # ファイル名の区切りはスペースだったりアンダースコアだったりするので、
  # 語のあいだは * で繋いで両方拾う（実例: "The Essence of Korey.txt" / "Mirina_s behavior.txt"）。
  # ファイル名自体にスペースが入るため、区切りは " | " を使う（スペース区切りだと境界が消える）。
  FOUND=$(cd "$PERSONA_DIR" && find . -maxdepth 4 -type f \
    \( -iname 'kg_korey*' -o -iname 'kg_mirina*' -o -iname '*essence*korey*' -o -iname '*mirina*behavior*' \) \
    -not -path './.git/*' 2>/dev/null | sed 's|^\./||' | sort | paste -sd'|' - | sed 's/|/ | /g')
  if [ -n "$FOUND" ]; then
    STATUS="ミリナの人格参照ファイルを .persona/ に同期済み（正本: ${PERSONA_REPO}）。検出したファイル: ${FOUND}"
  else
    STATUS="正本リポジトリは取得できたが、.persona/ 内に人格参照ファイルが見つからない。中身を確認すること（推測で補わない）。"
  fi
else
  STATUS="人格参照ファイルの同期に失敗（正本: ${PERSONA_REPO}）。.persona/ が無いので参照はスキップし、内容を捏造しないこと。"
fi

# ── 2. npm 依存 ───────────────────────────────────────────
if [ -f "$PROJECT_DIR/package.json" ] && [ ! -d "$PROJECT_DIR/node_modules" ]; then
  if (cd "$PROJECT_DIR" && npm install --no-audit --no-fund >/dev/null 2>&1); then
    STATUS="${STATUS} / npm 依存を用意済み（npm test・npm run build がすぐ動く）"
  else
    STATUS="${STATUS} / npm install に失敗。テスト前に手動で npm install が要る"
  fi
fi

# セッション冒頭のコンテキストへ状況を渡す（毎回探し回らずに済むように）
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$STATUS"
exit 0
