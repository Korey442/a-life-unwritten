#!/usr/bin/env bash
# PreToolUse ガード — 「承認ウインドウを、意味のあるときだけ出す」ための仕分け。
#
# 方針:
#   - 元に戻せる操作（読み取り・リポジトリ内の編集・テスト実行など）は自動で許可し、
#     承認ウインドウを出さない。承認待ちで止まらなければ、やり直しによる浪費も起きない。
#   - 取り返しのつかない操作だけ ask にし、「何をどうする操作か」を日本語で添える。
#     ご主人様が中身を読まずにOKを押さざるを得ない状況を作らないこと自体が目的。
#   - 明確に事故でしかないものだけ deny。
#
# 限界（承知の上で使うこと）:
#   これは「事故」を止める仕組みであって、悪意ある回避を防ぐものではない。
#   eval / bash -c / xargs 経由などは中身まで解析できないため、まとめて ask に落とす。
#   一覧に無いコマンドは自動で許可される。危険なものに気づいたら DANGER に足すこと。

set -uo pipefail

input=$(cat)
tool=$(printf '%s' "$input" | jq -r '.tool_name // ""')
repo="${CLAUDE_PROJECT_DIR:-/home/user/a-life-unwritten}"

# allow は理由を出さない（UIを汚さない）。ask/deny は理由を必ず添える。
allow() {
  jq -cn '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"allow"}}'
  exit 0
}

# $1=見出し  $2=影響の説明
ask() {
  local body="【確認】$1
${detail}
影響: $2"
  jq -cn --arg r "$body" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:$r},
      systemMessage:$r}'
  exit 0
}

deny() {
  local body="【拒否】$1
${detail}
理由: $2"
  jq -cn --arg r "$body" \
    '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r},
      systemMessage:$r}'
  exit 0
}

# 判断できないものは何も出力しない = Claude Code の通常動作に委ねる
passthrough() { exit 0; }

has() { printf '%s' "$cmd" | grep -Eq "$1"; }

case "$tool" in
  # ── 読み取り専用・副作用なし ────────────────────────────────
  Read|Grep|Glob|NotebookRead|ToolSearch|WebFetch|WebSearch|Skill|TodoWrite|\
  TaskCreate|TaskUpdate|TaskList|TaskGet|AskUserQuestion)
    allow
    ;;

  # ── ファイル編集 ───────────────────────────────────────────
  Edit|Write|NotebookEdit)
    path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // ""')
    detail="対象: ${path}"
    case "$path" in
      "$repo"/.persona/*)
        deny "使い捨て複製への書き込み" \
             ".persona/ は次回のセッション開始時に正本から上書きされるため、ここへの変更は必ず失われる。編集するなら正本リポジトリ mirina_note_pjt 側。" ;;
      "$repo"/.claude/*)
        ask "ガード設定そのものの変更" \
            "承認ルール（このガード）やフックの挙動が変わる。安全網を緩める変更でないか確認を。" ;;
      "$repo"/*)
        allow ;;   # リポジトリ内 = git で復元できる
      *)
        ask "リポジトリ外のファイルへの書き込み" \
            "git の管理外なので、上書きされると元に戻せない。" ;;
    esac
    ;;

  # ── シェル ────────────────────────────────────────────────
  Bash)
    raw=$(printf '%s' "$input" | jq -r '.tool_input.command // ""')
    # 表示は元のまま。長すぎる場合だけ切る（承認画面を読めるものにするため）
    detail="コマンド: $(printf '%s' "$raw" | head -c 300)"

    # ヒアドキュメントの本文は「データ」であって実行される命令ではない。
    # 判定対象から外さないと、危険な操作を *説明した文章*（コミットメッセージ、
    # ドキュメント、このガード自体の解説）が誤って引っかかる。実際に起きた。
    # ※ 本文をシェルに食わせる `bash <<EOF` 形式は下の「解析できない実行形態」で拾う。
    cmd=$(printf '%s' "$raw" | awk '
      BEGIN { skip = 0; delim = "" }
      skip == 1 {
        line = $0; sub(/[ \t]+$/, "", line)
        if (line == delim) skip = 0
        next
      }
      {
        if (match($0, /<<-?[ \t]*[^ \t|;&<>]+/)) {
          d = substr($0, RSTART, RLENGTH)
          sub(/^<<-?[ \t]*/, "", d)
          gsub(/[^A-Za-z0-9_]/, "", d)
          if (d != "") { delim = d; skip = 1 }
        }
        print
      }')

    # CLAUDE.md の規約により git は常に `git -C <path>` 形式で呼ばれる。
    # そのため "git" と サブコマンド の間に必ずオプションが挟まる。ここを吸収する接頭辞。
    G='git([[:space:]]+-[[:alnum:]-]+([[:space:]]+[^[:space:]]+)?)*[[:space:]]+'

    # ---- 拒否: 事故以外にありえないもの ----
    if has '(^|[^[:alnum:]_-])rm[[:space:]]+(-[[:alnum:]-]+[[:space:]]+)*(/|~|\$HOME|\$\{HOME\})([[:space:]]|$)'; then
      deny "ルート/ホームディレクトリの削除" "作業環境ごと破壊される。"
    fi
    if has "${G}"'(add|commit)[^&|;]*\.persona'; then
      deny ".persona/ を Git に載せる操作" \
           "CLAUDE.md の規約で禁止。人格ファイルの正本は別リポジトリで、複製をコミットすると二重管理になる。"
    fi
    if has "${G}"'push[^&|;]*(--force|--force-with-lease|[[:space:]]-f([[:space:]]|$))[^&|;]*(main|master)([[:space:]]|$)'; then
      deny "main/master への強制プッシュ" "共有ブランチの履歴が消える。他の作業も巻き込む。"
    fi

    # ---- 要確認: 取り返しがつかない / 外に出る ----
    has "${G}"'push' && \
      ask "リモートへのプッシュ" "GitHub 上のブランチが更新される。公開されたものは取り消しても記録に残る。"
    has "${G}"'reset[^&|;]*--hard' && \
      ask "作業内容の破棄 (reset --hard)" "コミットしていない変更が完全に消える。git では復元できない。"
    has "${G}"'(clean[^&|;]*-[[:alnum:]]*f|checkout[[:space:]]+--[[:space:]]|restore([[:space:]]|$))' && \
      ask "変更の取り消し (clean / checkout -- / restore)" "編集途中のファイルが消える。復元手段はない。"
    has "${G}"'(rebase|filter-branch|reflog[[:space:]]+expire)' && \
      ask "コミット履歴の書き換え" "既存のコミットが別物に置き換わる。プッシュ済みなら他の作業と衝突する。"
    has "${G}"'commit[^&|;]*--amend' && \
      ask "直前のコミットの作り直し" "元のコミットは別物に置き換わる。プッシュ済みなら履歴が食い違う。"
    has "${G}"'(branch[[:space:]]+-[dD]|tag[[:space:]]+-d|remote[[:space:]]+(remove|rm|set-url))' && \
      ask "ブランチ/タグ/リモートの削除・変更" "参照が失われると、そこにしか無いコミットは辿れなくなる。"
    has '(^|[^[:alnum:]_-])rm([[:space:]]|$)' && \
      ask "ファイルの削除" "ゴミ箱は無い。git 管理外のファイルは元に戻せない。"
    has '(^|[^[:alnum:]_-])(mkfs|dd|truncate|shred)([[:space:]]|$)' && \
      ask "ディスク/ファイルの破壊的操作" "内容が直接上書きされる。"
    has '(^|[^[:alnum:]_-])(sudo|chown)([[:space:]]|$)|chmod[[:space:]]+-R' && \
      ask "権限の変更・管理者権限での実行" "環境全体に影響しうる。"
    has 'npm[[:space:]]+publish|yarn[[:space:]]+publish' && \
      ask "パッケージの公開" "一度公開すると取り下げても記録は残る。"
    has 'curl[^&|;]*(-X[[:space:]]*(POST|PUT|DELETE|PATCH)|--data|-d[[:space:]])|wget[^&|;]*--post' && \
      ask "外部へのデータ送信" "送信先に記録が残る。取り消せない。"
    has '(^|[^[:alnum:]_-])(eval|source)([[:space:]]|$)|(bash|sh|zsh)([[:space:]]+-c|[[:space:]]*<<)|xargs[^&|;]*(rm|mv)|find[^&|;]*(-delete|-exec[[:space:]]+rm)' && \
      ask "中身を解析できない実行形態" "このガードが内容を判定できない（eval / bash -c / xargs / find -exec 経由）ため、念のため確認。"

    # ---- それ以外は通す ----
    allow
    ;;

  # ── MCP: 読み取りは通し、外部に影響するものは確認 ─────────
  mcp__github__*|mcp__Claude_Code_Remote__*)
    detail="操作: ${tool}"
    case "$tool" in
      *_get*|*_list*|*_search*|*_read*|*get_me*)
        allow ;;
      *create_pull_request*|*merge*|*push_files*|*issue_write*|*comment*|*review*|*create_or_update_file*|*delete_file*)
        ask "GitHub 上での外部に見える操作" \
            "他の人から見える場所に反映される。通知も飛ぶため、取り消しても見られた事実は残る。" ;;
      *add_repo*|*register_repo_root*)
        ask "リポジトリをセッションに追加" "このセッションから読み書きできる範囲が広がる。" ;;
      *)
        passthrough ;;
    esac
    ;;

  *)
    passthrough
    ;;
esac
