#!/usr/bin/env bash
# 承認ガードを「そのユーザーの全プロジェクト」に適用する。
#
#   bash .claude/hooks/install-guard.sh                 … ~/.claude/ に導入
#   bash .claude/hooks/install-guard.sh --print-cloud-setup
#       … クラウド（claude.ai/code）環境の Setup script 欄に貼る内容を出力。
#         クラウドは毎回まっさらなVMで起動し、手元の ~/.claude は引き継がれないため、
#         セットアップスクリプトで毎回入れ直す必要がある。
#
# 既存の ~/.claude/settings.json は壊さずマージする（同じフックの二重登録もしない）。

set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)/guard.sh"
[ -f "$SRC" ] || { echo "guard.sh が見つかりません: $SRC" >&2; exit 1; }

if [ "${1:-}" = "--print-cloud-setup" ]; then
  cat <<'CLOUD_HEAD'
#!/bin/bash
# 承認ガードをクラウドセッションの全プロジェクトに導入する。
# claude.ai/code の環境設定 → Setup script 欄に、この内容をそのまま貼る。
set -e
mkdir -p ~/.claude/hooks
cat > ~/.claude/hooks/guard.sh <<'GUARD_EOF'
CLOUD_HEAD
  cat "$SRC"
  cat <<'CLOUD_TAIL'
GUARD_EOF
chmod +x ~/.claude/hooks/guard.sh
S=~/.claude/settings.json
[ -f "$S" ] || echo '{}' > "$S"
jq --arg c "$HOME/.claude/hooks/guard.sh" '
  .hooks //= {}
  | .hooks.PreToolUse =
      (((.hooks.PreToolUse // []) | map(select([.hooks[]?.command] | index($c) | not)))
       + [{hooks:[{type:"command",command:$c,timeout:10}]}])
' "$S" > "$S.tmp" && mv "$S.tmp" "$S"
echo "承認ガードを導入しました"
CLOUD_TAIL
  exit 0
fi

DEST_DIR="$HOME/.claude/hooks"
DEST="$DEST_DIR/guard.sh"
SETTINGS="$HOME/.claude/settings.json"

command -v jq >/dev/null || { echo "jq が必要です" >&2; exit 1; }

mkdir -p "$DEST_DIR"
cp "$SRC" "$DEST"
chmod +x "$DEST"
echo "配置: $DEST"

if [ -f "$SETTINGS" ]; then
  cp "$SETTINGS" "$SETTINGS.bak.$(date +%Y%m%d%H%M%S)"
  echo "既存の設定を退避: $SETTINGS.bak.*"
else
  echo '{}' > "$SETTINGS"
fi

jq --arg c "$DEST" '
  .hooks //= {}
  | .hooks.PreToolUse =
      (((.hooks.PreToolUse // []) | map(select([.hooks[]?.command] | index($c) | not)))
       + [{hooks:[{type:"command",command:$c,timeout:10}]}])
' "$SETTINGS" > "$SETTINGS.tmp"
mv "$SETTINGS.tmp" "$SETTINGS"

echo "登録: $SETTINGS の PreToolUse"
echo
echo "これで、このマシンの全プロジェクトで承認ガードが効きます。"
echo "反映には Claude Code の再起動（または /hooks を一度開く）が必要です。"
