#!/usr/bin/env bash
# Stop フック — ミリナの一人称の混入だけを、機械的に止める。**検出の担当。**
#
# 役割分担（重要）:
#   予防は persona-remind.sh がやる（毎ターン、人格を生成の直前へ置き直す）。
#   ここはその網をすり抜けた一件を捕まえる保険であって、主役ではない。
#
# なぜ一人称**だけ**なのか:
#   正規表現に「ミリナらしさ」は判定できない。です・ます調まで機械判定させると、
#   表・見出し・体言止めで誤検知する。**誤検知の出るフックは外される。**
#   外されたら何も守っていないのと同じなので、狭くて確実な一点に絞る。
#   一人称は二値で判定でき、しかも劣化がいちばん分かりやすく現れる場所である。
#
# 誤検知を避けるため、判定の前に次を本文から取り除く:
#   - コードフェンス（``` … ```）とインラインコード
#   - 引用行（先頭が >）……本文の引用にはご主人様の「僕」が正しく出る
#   - 「」『』の中……台詞の引用、および「私」という語そのものを論じる場合
#
# セッションを止めないことを優先し、判定できないときは必ず許可して抜ける。
set -uo pipefail

command -v jq >/dev/null 2>&1 || exit 0

input=$(cat)

# 自分が出した block で再入したときは、無条件に通す（無限ループ防止）。
[ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0

transcript=$(printf '%s' "$input" | jq -r '.transcript_path // ""')
[ -n "$transcript" ] && [ -f "$transcript" ] || exit 0

# 直近の assistant メッセージのテキストだけを取り出す。
# 全体を舐めると重いので末尾だけ見る。壊れた行は捨てる。
last_text=$(tail -n 400 "$transcript" 2>/dev/null \
  | jq -rs '[ .[]? | select(.type? == "assistant") ] | last
            | (.message.content? // []) | map(select(.type? == "text") | .text) | join("\n")' \
    2>/dev/null) || exit 0
[ -n "$last_text" ] && [ "$last_text" != "null" ] || exit 0

# ── 判定対象から、引用・コードを取り除く ─────────────────
# 鉤括弧の除去に sed の [^」] は使えない。ロケールが UTF-8 でない環境では
# 文字クラスの否定がバイト単位で評価され、3バイト文字が壊れる（実際に壊れた）。
# 開き括弧と閉じ括弧を**文字列として index() で探す**方式なら、ロケールに依存しない。
stripped=$(printf '%s' "$last_text" | awk '
  # 引数名に close は使えない（awk の組み込み関数名。mawk は構文エラーになる）
  function strip_pairs(s, ob, cb,   out, i, j, rest) {
    out = ""
    while ((i = index(s, ob)) > 0) {
      out = out substr(s, 1, i - 1)
      rest = substr(s, i + length(ob))
      j = index(rest, cb)
      if (j == 0) { return out rest }   # 閉じが無ければ、以降はそのまま残す
      s = substr(rest, j + length(cb))
    }
    return out s
  }
  /^[[:space:]]*```/ { infence = !infence; next }
  infence            { next }
  /^[[:space:]]*>/   { next }
  {
    line = strip_pairs($0, "`", "`")
    line = strip_pairs(line, "「", "」")
    line = strip_pairs(line, "『", "』")
    print line
  }
')

# 残った本文に、ミリナが名乗ってはいけない一人称があるか。
hit=$(printf '%s' "$stripped" | grep -o -E '僕|俺|私|わたし|ワタシ' | sort -u | tr '\n' ' ')
[ -n "$hit" ] || exit 0

# 1ターンにつき2回まで。それ以上は通す（直せないまま閉じ込めない）。
sid=$(printf '%s' "$input" | jq -r '.session_id // "nosession"' | tr -c 'A-Za-z0-9_-' '_')
counter="${TMPDIR:-/tmp}/mirina-persona-guard.${sid}"
n=$(cat "$counter" 2>/dev/null || echo 0)
if [ "$n" -ge 2 ]; then rm -f "$counter"; exit 0; fi
echo $((n + 1)) > "$counter"

jq -cn --arg hit "$hit" '{
  decision: "block",
  reason: ("ミリナの一人称が崩れています。返答の地の文に「" + $hit + "」が出ました。\n" +
           "ミリナの一人称は「ミリナ」です。「私」「わたし」「僕」「俺」は使いません。\n" +
           "とくに本文（一人称「僕」の地の文）を書いた直後は、ご主人様の一人称を借りやすくなります。\n" +
           "同じ内容を、ミリナの言葉で言い直してください。謝罪や自己批判は要りません。言い直すだけで足ります。\n" +
           "（本文の引用・コード・「」の中は判定から除いてあります。それでも出た＝地の文です）")
}'
exit 0
