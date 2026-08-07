#!/bin/bash
# SessionStart フック（クラウド／ローカル共通）。セッション開始のたびに走る。
#
#  ミリナの人格参照ファイルを正本リポジトリから .persona/ へ同期する。
#  正本は別リポジトリ（更新され続ける）。**このリポジトリには実体を置かない**——
#  二箇所に本物があると必ずどちらかが古くなるため。.persona/ は .gitignore 済み。
#
# セッションを止めないことを優先し、`set -e` は使わず必ず exit 0 で終える。
# 正本が落ちていても、同期に失敗したという事実を additionalContext で伝えるだけにする。
set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
PERSONA_DIR="$PROJECT_DIR/.persona"
PERSONA_REPO="${PERSONA_REPO:-https://github.com/Korey442/mirina_note_pjt.git}"

# ── 人格参照ファイルの同期 ───────────────────────────────
# 一時領域へ浅くクローン → **.git を削除** → .persona/ へ入れ替える。
#
# .git を消すのが肝。プロジェクトの中に入れ子のGitリポジトリがあると、
# うっかり `cd .persona` した状態で git を叩いたとき、別リポジトリを操作してしまう
# （実際に一度やった）。ただのファイル置き場にしておけば、その事故は起こり得ない。
# 履歴が無いので毎回クローンし直すが、正本は 2MB 程度なので許容する。
#
# ※ かつてここで npm 依存も用意していたが、小説へ目的を変更してゲーム実装を削除したので
#   （package.json ごと消えた）、その節は落とした。
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/persona.XXXXXX")"
SYNCED=0
if git clone -q --depth 1 "$PERSONA_REPO" "$TMP_DIR/src" 2>/dev/null; then
  rm -rf "$TMP_DIR/src/.git"
  rm -rf "$PERSONA_DIR.old"
  [ -d "$PERSONA_DIR" ] && mv "$PERSONA_DIR" "$PERSONA_DIR.old"
  mv "$TMP_DIR/src" "$PERSONA_DIR" && SYNCED=1
  rm -rf "$PERSONA_DIR.old"
fi
rm -rf "$TMP_DIR"

if [ "$SYNCED" = "0" ] && [ -d "$PERSONA_DIR" ]; then
  # 取得に失敗しても前回分が残っていれば使う。ただし古い可能性を明示する。
  STALE=" ※今回の同期には失敗。前回取得分（古い可能性あり）を表示している。"
else
  STALE=""
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
    STATUS="ミリナの人格参照ファイルを .persona/ に同期済み（正本: ${PERSONA_REPO}）。検出したファイル: ${FOUND}${STALE} なお .persona/ は Git 管理下ではない使い捨ての複製なので、直しても次回消える（編集は正本側で行う）。"
  else
    STATUS="正本リポジトリは取得できたが、.persona/ 内に人格参照ファイルが見つからない。中身を確認すること（推測で補わない）。"
  fi
else
  STATUS="人格参照ファイルの同期に失敗（正本: ${PERSONA_REPO}）。.persona/ が無いので参照はスキップし、内容を捏造しないこと。"
fi

# セッション冒頭のコンテキストへ状況を渡す（毎回探し回らずに済むように）
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$STATUS"
exit 0
