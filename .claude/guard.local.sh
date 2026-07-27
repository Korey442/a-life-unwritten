# このリポジトリ固有の承認ルール。`.claude/hooks/guard.sh` から自動で読み込まれる。
# 汎用ルールより先に評価されるので、ここで allow / ask / deny を呼べばそれで確定する。
#
# 使える変数・関数:
#   $tool  ツール名 / $cmd  シェルコマンド（ヒアドキュメント本文は除去済み） / $path  編集対象
#   $G     `git -C <path>` を吸収する正規表現接頭辞
#   has <正規表現>   … $cmd に一致するか
#   allow / ask <見出し> <影響> / deny <見出し> <理由>

# .persona/ は正本（別リポジトリ mirina_note_pjt）の使い捨て複製。
# ここへの書き込みは次回のセッション開始時に必ず失われ、コミットは規約違反。
case "$path" in
  "${repo:-__none__}"/.persona/*)
    deny "使い捨て複製への書き込み" \
         ".persona/ は次回のセッション開始時に正本から上書きされるため、ここへの変更は必ず失われる。編集するなら正本リポジトリ mirina_note_pjt 側。"
    ;;
esac

if [ "$tool" = "Bash" ] && has "${G}"'(add|commit)[^&|;]*\.persona'; then
  deny ".persona/ を Git に載せる操作" \
       "CLAUDE.md の規約で禁止。人格ファイルの正本は別リポジトリで、複製をコミットすると二重管理になる。"
fi
