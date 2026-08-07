#!/usr/bin/env bash
# persona-guard.sh / persona-remind.sh のテスト。
# `bash .claude/hooks/persona-guard.test.sh` で実行する。
#
# いちばん大事なのは「**本文の引用は通る**」ほうである。
# 本編は一人称「僕」の地の文なので、引用のたびに止められると
# フックそのものが外される。止まらないことのテストを先に置いている。

cd "$(dirname "$0")/../.." || exit 1
GUARD=.claude/hooks/persona-guard.sh
REMIND=.claude/hooks/persona-remind.sh
pass=0; fail=0
TMP=$(mktemp -d)
trap 'rm -rf "$TMP" "${TMPDIR:-/tmp}"/mirina-persona-guard.t_*' EXIT

# フックは許可のとき**何も出力せずに** exit 0 する（guard.sh と同じ作法）。
# jq に空を食わせると空文字が返るので、ここで "pass" に均す。
decide() { "$GUARD" | jq -r '.decision // "pass"' 2>/dev/null | grep . || echo pass; }

# $1=期待(block|pass) $2=説明 $3=ミリナの返答本文
check() {
  local want=$1 name=$2 text=$3 got sid tr
  sid="t_$((RANDOM))_$((RANDOM))"
  tr="$TMP/$sid.jsonl"
  jq -cn --arg t "$text" \
    '{type:"assistant",message:{role:"assistant",content:[{type:"text",text:$t}]}}' > "$tr"
  got=$(jq -cn --arg p "$tr" --arg s "$sid" '{transcript_path:$p,session_id:$s}' | decide)
  if [ "$got" = "$want" ]; then
    pass=$((pass+1)); printf '  ok   %-5s %s\n' "$got" "$name"
  else
    fail=$((fail+1)); printf '  FAIL 期待=%-5s 実際=%-5s %s\n' "$want" "$got" "$name"
  fi
}

echo "■ 正しいミリナの返答は止めない"
check pass "ミリナと名乗る" \
  'ご主人様。第二節を書き終えました。ミリナは正典の該当箇所を先に確かめております。'
check pass "ツンデレも通る" \
  'べ、別にご主人様のためではありません！　……ただ、お役に立てたなら、ミリナは嬉しいです。'

echo "■ 本文の引用は止めない（これが外されない条件）"
check pass "鉤括弧の中の僕" \
  'ご主人様。第一節の「僕は何すればいいの」に対応する箇所を直しました。'
check pass "引用行の僕" \
  '該当箇所です。

> 僕も出した。昨日と同じ景色だった。

ここに続けて書きます。'
check pass "コードフェンスの中の僕" \
  '差分です。

```
+僕は端末を見た。二年前に買ったやつだ。
```

以上です。'
check pass "インラインコードの僕" \
  '検索語は `僕` です。地の文の一人称を数えました。'
check pass "私という語そのものを論じる" \
  '正典にこうあります。「私」は主体の証拠になりません。空欄だからです。'
check pass "二重鉤括弧の中" \
  'ご主人様が『僕』と仰った箇所は、そのままにしてあります。'

echo "■ ミリナの地の文に混ざったら止める"
check block "僕が主語" \
  'ご主人様。書いた僕が分かっているつもりでいました。直します。'
check block "僕の所有格" \
  '僕の書き方が悪かったので、削除ログの箇所を書き直します。'
check block "私" \
  'ご主人様。私はそこを見落としておりました。'
check block "わたし" \
  'わたしの確認が足りませんでした。'
check block "引用の外に出ている" \
  '「僕は何すればいいの」の箇所ですが、僕はここを直すべきだと思います。'

echo "■ 閉じ込めない"
sid="t_loop"; tr="$TMP/loop.jsonl"
jq -cn '{type:"assistant",message:{role:"assistant",content:[{type:"text",text:"僕がやりました。"}]}}' > "$tr"
got=$(jq -cn --arg p "$tr" --arg s "$sid" '{transcript_path:$p,session_id:$s,stop_hook_active:true}' | decide)
if [ "$got" = "pass" ]; then pass=$((pass+1)); printf '  ok   pass  stop_hook_active なら通す\n'
else fail=$((fail+1)); printf '  FAIL 期待=pass  実際=%-5s stop_hook_active なら通す\n' "$got"; fi

sid="t_cap"
for i in 1 2 3; do
  got=$(jq -cn --arg p "$tr" --arg s "$sid" '{transcript_path:$p,session_id:$s}' | decide)
done
if [ "$got" = "pass" ]; then pass=$((pass+1)); printf '  ok   pass  3回目は通す（上限2回）\n'
else fail=$((fail+1)); printf '  FAIL 期待=pass  実際=%-5s 3回目は通す（上限2回）\n' "$got"; fi

echo "■ 壊れた入力でセッションを止めない"
got=$(printf '%s' '{"session_id":"t_none"}' | decide)
if [ "$got" = "pass" ]; then pass=$((pass+1)); printf '  ok   pass  transcript が無くても通す\n'
else fail=$((fail+1)); printf '  FAIL 期待=pass  実際=%-5s transcript が無くても通す\n' "$got"; fi

echo "■ 予防フックは人格を毎ターン注入する"
got=$(printf '%s' '{}' | "$REMIND" | jq -r '.hookSpecificOutput.hookEventName // ""')
if [ "$got" = "UserPromptSubmit" ]; then pass=$((pass+1)); printf '  ok   pass  UserPromptSubmit を返す\n'
else fail=$((fail+1)); printf '  FAIL 期待=UserPromptSubmit 実際=%-5s\n' "$got"; fi
got=$(printf '%s' '{}' | "$REMIND" | jq -r '.hookSpecificOutput.additionalContext // ""')
case "$got" in
  *ミリナ*) pass=$((pass+1)); printf '  ok   pass  人格チェックを含む\n' ;;
  *) fail=$((fail+1)); printf '  FAIL 人格チェックが空\n' ;;
esac

echo
echo "合格 $pass / 失敗 $fail"
[ "$fail" -eq 0 ]
