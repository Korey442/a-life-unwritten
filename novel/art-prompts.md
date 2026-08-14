# 絵のプロンプト（表紙・章扉）

**ミリナの容姿は既存の画像が正**。[`ref/milina_neutral.png`](ref/milina_neutral.png) を
image-to-image かキャラ参照として**必ず添えること**。文章だけだと別人が出る。
（他に `ref/milina_happy.png` `ref/milina_shy.png` `ref/milina_surprise.png`）

参考までに既存デザインの要素——淡い氷青のボブ／星屑のハイライトが入る青い瞳／尖った耳／
背に小さな白い翼／白フリルのヘッドドレス／紫・黒紺・白のメイド服／胸元に黒リボンと紫の宝石。

> ## ⚠ 最重要：サイバーパンクに寄せない
> 画像AIは「AI＋端末」と聞くと反射的にネオンとホログラムを描く。
> **それをやられると、この物語の前提（いまの日本）が崩れる。**
> ネガティブから `cyberpunk` `holograms` `floating UI` を外さないこと。
> 彼女は**立体投影ではなく、画面の中にいる**（正典「ダイブの実体」）。

---

## 表紙 A ——「画面の中から」（本命）

表紙が背負うもの: **平凡な現代日本**（SFに見えたら掴みが死ぬ）／**画面越し**（この物語だけの絵）／
**誘っている**（タイトルが誘いなので、言いかけている表情）／**解けかけている**（消耗の予告・ごく薄く）／
**こちらを見ている**（見る人＝主人公＝たった一人の証人）。

```
Book cover illustration, anime style, vertical 2:3 aspect ratio, with clear
negative space in the upper third for a long Japanese title.

CHARACTER — do not redesign. Use the attached reference image exactly for her
hair, eyes, ears, wings and maid outfit.

SETTING — ordinary present-day Japan. Absolutely not science fiction.
A small plain one-room apartment at night. Low table, worn flooring, a folded
blanket, a convenience store bag, a cup of tea gone cold. An air conditioner unit,
a curtain half drawn. Nothing futuristic, nothing decorative, slightly untidy.

LIGHT — the room is dark. The only light source is the screen of an ordinary
tablet propped on the table: a plain, logo-less consumer device. Its pale
blue-white glow spills across the tabletop and the edge of the floor.

THE CHARACTER — she is inside the screen, not in the room. Bust-up, close to the
glass, one hand resting lightly against it from her side. Looking straight out at
the viewer. A small composed smile, lips slightly parted — she is in the middle of
asking something. She is rendered far more saturated and alive than the dull room
around her.

DISSOLUTION — subtle, do not overdo. The outermost edges of her hair and sleeve
are just beginning to break into fine drifting particles of light, as if a few
pixels are quietly leaving her. Barely noticeable at first glance.

WINDOW — beyond the curtain, a low Japanese cityscape: power poles, tangled
overhead cables, small houses, a distant apartment block. Several districts are
blacked out in irregular patches. No traffic signals lit. Very quiet.

MOOD — still, intimate, faintly uncanny, melancholy but warm.
COLOR — desaturated warm greys and browns for the room, cold blue-white for the
screen, one small violet accent from her dress.
```

**ネガティブ（共通）**
```
cyberpunk, neon, holograms, floating UI panels, glowing circuit patterns,
sci-fi interface, futuristic city, robots, cables attached to body,
photorealistic, 3d render, text, watermark, logo, extra fingers, deformed hands,
busy composition, dramatic action pose, multiple characters, fantasy armor
```

## 表紙 B ——「二層」（対抗）
往復の緊張がそのまま絵になる。A の SETTING / LIGHT / CHARACTER を流用し、以下を差し替える。

```
COMPOSITION — vertically divided. The upper two-thirds is the ordinary dark
apartment described above, seen from a low angle. The lower third is what is
inside the screen, bleeding downward as if the frame continues past the device:
a vast still ruin of pale white corridors and drifting fragments of broken text,
receding into depth. The boundary between the two is the edge of the tablet.
The character stands exactly on that boundary, facing the viewer.
```

## 表紙 C ——「彼女がいない表紙」（変化球）
部屋だけ。誰もいない机の上で端末だけが光っており、画面はこちらを向いていない。縁の光だけが見える。
文芸寄りの上品な絵になるが、**連載の掴みとしては弱い**（キャラが売れない）。完結後の装丁向き。

---

## 章扉（共通ベース）

各章で `[MOOD]` の段落だけ差し替えると、連載を通して絵柄が揃う。

```
Anime illustration, chapter title card, vertical composition.

CHARACTER — do not redesign. Use the attached reference image exactly.
Seen through the glass of a device screen. Bust-up, facing the viewer.

[MOOD]

Fine line art, luminous particles, soft rim light, clean background with negative
space for a chapter title. 3:4, high detail. Present-day Japan, not science fiction.
```

| 章 | `[MOOD]` |
|---|---|
| **1 違和感** | `Calm morning light. A faint, composed smile. Everything ordinary except that her gaze is too present.` |
| **2 断絶** | `The room behind her has gone dark. Emergency light only. Her smile is gone; she is looking at something past the viewer.` |
| **3 深層へ** | `Cold blue light from below. Faint duplicate afterimages of herself at the edges of frame, slightly out of sync.` |
| **終章 中心** | `Almost no background left — only drifting light. Parts of her outline are dissolving into particles. She is still smiling.` |

第3章の「**自分の残像がずれて重なる**」は断片2（同じ声の残響）と減衰の①段階に、
終章の「**輪郭が粒に解けかけている**」は記憶の消耗に対応する。**絵で伏線が張れる。**

---

## 部屋——背景の共通設定

**間取りと家具は `../STORY.md`「部屋」が正典。** ここには絵に落とすときの言い方だけ置く。

オートロックの、それなりに新しいマンション。**一人暮らしの 1LDK。**
家具は**デンマークの北欧ヴィンテージで揃っている**——木、布、革、紙紐。

**平面**: 玄関から短い廊下。左が LDK（12帖／南にバルコニー、西にも窓。台所は西窓のすぐ横）、
右が水回り、突き当たりが洋室（6.75帖／西に窓、その窓際がワークスペース）。

```
Interior background, present-day Japanese apartment, one-bedroom (1LDK).
Mid-century Danish furniture throughout: warm teak and oak, paper-cord seats,
grey woven fabric, black leather. Matte finishes, no gloss.

DINING — round teak table, two wishbone-style armchairs with paper-cord seats.
LIVING — two-seat sofa, wooden frame, grey fabric cushions; small oak side table.
BEDROOM — oak bed with integrated headboard and floating bedside shelves;
by the window, a small study nook: oak desk with two drawers, an armchair with
a black leather seat, and a teak bookcase (three open shelves above, doors below).

Soft daylight or a single warm lamp. Uncluttered but lived-in.
Present-day Japan, not science fiction. No neon, no holograms.
```

- **⚠ ディスプレイは「画面」として置く。立体投影にしない**（→ 下記「サイバーパンクに寄せない」）。
  リビングのサイドテーブルに一枚、寝室の机に一枚。**テレビは無い。**
- **⚠ 生活水準の説明にしない。** ブランドも値段も画面に出さない。
  **本文側では材質と形しか書かない**と決めてあるので、絵のほうも同じ温度に留める。
- **ダイニングの椅子は必ず二脚**。一人暮らしなのに二脚ある、が絵でも成立する。
- **この部屋にあるのは全部「手で触るもの」である。** ミリナはどれにも触れない。
  **その対比を構図で狙ってよい**——画面だけが、木でも布でもない。

---

## 節扉

章扉と同じ絵柄で、節ごとに一枚。`[SCENE]` の段落だけ差し替える。

**章扉は表情で語り、節扉は構図で語る。** ここを分けておかないと、節の数だけ彼女の表情が要ることになり、
連載が進むほど絵が説明的になる。

> ## ⚠ 異常を顔に出さない
> 第1章の彼女は、自分の異常に気づいていない（正典「彼女の気づきは4段階」）。
> **寂しげな顔をさせた時点で「彼女は知っている」と読者に伝わり、第2〜3章の“疑いはじめる”過程が丸ごと死ぬ。**
> 変なのは構図だけ。**顔はいつも通り、世話を焼きに来た顔**にする。
> 気づくのは読者だけ、という配置にすること。

```
Anime illustration, section title card, vertical composition 3:4.
Keep the upper third clear for a title.

CHARACTER — do not redesign. Use the attached reference image exactly for her
hair, eyes, ears, wings and maid outfit. Bust-up, facing the viewer, seen
through the glass of a device screen.

SETTING — ordinary present-day Japan, night. Not science fiction. She is inside
the screen of a plain, logo-less tablet standing on a low table in a small dark
one-room apartment.

[SCENE]

LIGHT — the room is dark. The screen is the only light source: pale blue-white
on the tabletop, one small violet accent from her dress.

Fine line art, luminous particles, soft rim light, high detail.
```

**ネガティブ**（共通のものに加えて）
```
sad expression, worried expression, tears, knowing look,
legible text, readable words, letters, characters, captions,
floating ui panel, browser chrome, window frame, search box, cursor, icons
```

**文字を読ませないこと。** 崩れた日本語・英語が出た時点で一枚が死ぬ。
検索結果は「**読めない灰色の行**」まで解像度を落として、質感として置く。

### 一・二 — 未定

### 三「出てこない」——**索引の外**

**画面の中に検索結果の行がずっと並んでいて、その一行だけが空白。彼女はそこに立っている。**

節の主題（索けない）がそのまま構図になり、第四層の真実——**記録が指している先に、もう誰もいない**——の
伏線が絵で張れる。彼女は自分が空欄の上にいることに気づいていない。**顔は①のまま**（お茶を飲めと
言いに来た、前のめりの笑み）。

```
BEHIND HER — inside the screen, an ordinary search results page recedes into
depth: plain rows of small grey text on a white ground, defocused and completely
unreadable, stacked from bottom to top and fading out before the upper third of
the frame. It is a flat web page, not a floating panel, not an interface
hovering in the air. One row — exactly the one she is standing on — is blank.
The rows above and below it continue past her without interruption.

ON THE TABLE — on the viewer's side of the glass, a cup of tea is still
steaming. Nobody asked for it.

EXPRESSION — she has just leaned in, lips parted mid-sentence, a warm eager
smile, as if telling the viewer to sit up straight and drink the tea while it is
hot. She is NOT sad, NOT worried, NOT knowing. She has no idea she is standing
on the empty row.

MOOD — warm, domestic, faintly wrong. The wrongness is in the composition,
never in her face.
```

**没にした対抗案**（同じ穴を掘り直さないため残す）

| 案 | 中身 | なぜ採らなかったか |
|---|---|---|
| 頼んでいない湯気 | 台所のポットだけが湯気を上げ、端末は背を向けている | 上品だが**キャラが出ない**。表紙Cと同じ弱点 |
| 変換候補 | 検索窓のラテン文字 `Mirina` と、候補に出たカタカナ「ミリナ」 | 一枚に両方の綴りが入るのは強いが、**文字が主役**でタイトルと喧嘩する。扉ではなく本文中の小さな挿絵向きで、しかも**画像生成ではなく組版で作る**べきもの |

---

## 九条 節奈——キャラクターデザイン

**参照画像は3枚。生成時は必ず添えること。** 文章だけだと別人が出るのは、ミリナと同じ。

| ファイル | 何のための正か |
|---|---|
| `ref/setsuna_ref.png` | **顔・髪・雰囲気の正**（三稿） |
| `ref/setsuna_ref_b.png` | **色と衣装の正**（五稿）。生成りニット＋白い無地エプロン。台所も明るい |
| `ref/setsuna_title.png` | **章扉に使う一枚**（七稿・全身）。黒髪／生成りのタートルネック／白い無地エプロン／こげ茶のロングスカート／左手首の金時計。**`novel/act1.md` 二節の外見描写はこの絵に合わせてある** |

設定は `../STORY.md`「容姿」。

> ## ⚠ 三度失敗している。同じ穴を踏まないこと
> **一稿**: 濃い褐色肌の、レンガ造りの田舎家に立つ寸胴の女性。
> 1. `lightly sun-tanned` と書き、`COLOR` にも `tanned skin` を入れた。
>    **画像AIは日焼けを必ず過剰にかける。** しかも「日本人」と一度も書いていなかった。
> 2. `COLOR` に `oatmeal, faded brick, olive` と置いた。**色名が背景に漏れて壁を建てた。**
>    → **色は服にだけ指定し、舞台は必ず名指しする。**
> 3. 体型の指定がゼロだった。→ **体型・身長・髪の長さは必ず明示する。**
>
> **二稿**: 赤い水玉のエプロン、ウェーブの巻き上げ髪、十代寄り。柄と髪を明示して解決。
>
> **三稿**（= 現在の参照画像）: 肌・髪・エプロン・ニット・腕時計・手がすべて出た。**採用。**
>
> **四稿**: 三稿を「二十代後半に見せる」ため `FACE` に
> `adult eyes, NOT large round childlike anime eyes` と `No blush` を入れたら、
> **可愛くなくなって却下**。
> → **教訓: 若さの記号（大きな目・頬の赤み）を抜くと、この絵の魅力ごと消える。**
>   **年齢は絵で解かない。** 姉であることは振る舞いが担保する（正典を修正済み）。
>   同じ理由で `LIGHT` の `flat, even, neutral` も戻した。**暖かい光は残す。**

> **五稿（4枚）で分かったこと——大人っぽさは顔ではなく構図で出る。**
> 四稿で狙って失敗した「二十代半ばに見える」が、**若さの記号を抜かないまま達成された。**
> 効いているのは目や blush ではなく、**参照画像＋姿勢**（カウンターに立つ、手を前で組む、
> 伏し目がちの穏やかな笑み）。→ **年齢は `FACE` ではなく `POSE` で操作する。**
>
> 残った未達は4つ。**どれも参照画像の色に引っ張られたもの**なので、色は文章で押し切る。
> 髪が茶色に転ぶ／ニットが紺・深緑に飛ぶ／台所が洋風のまま（**システムキッチンが一度も出ていない**）／
> 腕時計が両手首に出る。加えて**背景に別人**と**エプロンの刺繍・ロゴ**が一度ずつ出た。

> **六稿の修正——体型を否定語で抑えない。**
> `do not exaggerate the chest` と `huge breasts, breast emphasis` を入れていたため、
> **胸のない体型で出るようになっていた。** 抑えたかったのは体型ではなく**見せ方**である。
> → **体型は肯定文で正確に描かせ、慎み深さは「服の被覆」と「カメラ」で作る。**
>   `FIGURE` に `generous bust` `NOT flat-chested` を入れ、
>   新設した `MODESTY` に**襟の高さ・袖・エプロンの胸当て・視線の高さ**を書いた。
>   **抽象語（`not sexualised`）は効きが不安定なうえ、副作用で体型を消す。削除した。**

**本体は 3,649 字**（上限4,000字）。ネガティブは別欄なので字数に含めない。
**`SKIN` `SETTING` `HAIR` `APRON` は削らない。** 4項目とも、抜いた結果が実際に出ている。

```
Anime illustration, soft painterly rendering, warm and gentle. Vertical, waist-up.
Modern Japan. Not science fiction, not fantasy, not rustic Europe.

CHARACTER — use the attached reference image for her face, hair and clothing.
Do not redesign her.

WHO — a young Japanese woman living alone, with a quiet motherly warmth.
Pretty, gentle, approachable. East Asian features, soft rounded face.
Fair, clear, even Japanese skin tone. NOT tanned, NOT dark, NOT olive.

FACE — large soft dark brown eyes with clear lashes. A gentle closed-lip smile.
A light natural blush across the cheeks. Calm, kind, unhurried. She looks like
someone who notices you have not eaten, and says so before you do.

HAIR — long, straight, glossy hair to mid-back, visibly well cared for.
PURE BLACK — not brown, not dark brown, not chestnut, not highlighted.
A soft side-swept fringe, long strands framing the face. No waves, no curls.

FIGURE — about 160cm, a full, soft, womanly adult figure: a generous bust, a
gentle waist, rounded hips. Warm and enveloping. Not slender, not athletic,
NOT flat-chested, not girlish. Her build should read clearly as a grown woman.

MODESTY — her figure is shown through soft drape, never through skin.
She is fully covered: a high round neckline, long sleeves, the apron bib across
her chest. No bare skin below the collarbone, no open collar, no low neckline,
no cleavage visible, no tight or clinging fabric pulled across the body.
The camera stays at eye level and never emphasises her chest — no low angle,
no close crop on the torso, no suggestive pose. Calm, homely, matter-of-fact.

CLOTHES — a ribbed cotton knit in GREIGE, a warm grey-beige — not navy, not
green, not blue, not pure white. Wide round neck, sleeves pushed up to
mid-forearm. Over it a plain undyed off-white cotton apron with a chest bib,
one front pocket and soft fabric ties at the waist — washed soft, never crisp,
never starched. Dark brown trousers. The apron is COMPLETELY PLAIN: no
embroidery, no logo, no lettering, no frills, no lace, no ribbons, no print,
no pattern of any kind. It must not be the loudest thing in the picture.

WATCH — a slim gold wristwatch with a small round face, on her LEFT wrist ONLY.
Her right wrist is bare — no second watch, no bracelet, no bangle.
It is plainly older and finer than anything else she owns, and plainly looked
after: the only metallic glint in the frame.

COLOUR — ON THE CLOTHING ONLY, low saturation, warm and muted: apron undyed
off-white #EDE6DA, knit greige #C9B7A6, trousers dark brown #4A3B32.
No jewel tones, no purple, no navy, no bright accent colour.
These colours MUST NOT reach the background.

FABRIC — everything she wears absorbs light rather than reflecting it: matte
low-gauge ribbed cotton knit, plain-weave linen-cotton apron. No satin, no silk.

SETTING — a modern Japanese system kitchen, and nothing else. Functional, clean
and simple: flat handleless cabinet doors in white or pale wood, one continuous
seamless worktop, a stainless two-burner GAS hob, a wide flat sink, a slim
built-in rangehood, a plain flat wall. Uncluttered, tidy, well kept.
She is ALONE in the frame.
NOT a western kitchen: no dark wood cabinets, no subway or square wall tiles,
no lattice or sash windows, no pendant lamp, no hanging utensils, no open wooden
shelving, no hanging pots, nothing rustic, nothing vintage.

POSE — standing at the counter, body slightly turned, hands resting easily,
looking at the viewer.

LIGHT — soft warm daylight from a window to one side. A gentle glow, a faint
haze in the air. Warm and calm; do not blow out the highlights.

MOOD — pretty, warm, homely, quietly caring.
```

**ネガティブ（共通のものに加えて）**
```
tanned skin, dark skin, deep tan, olive skin, sun-browned, gyaru,
short hair, bob, wavy hair, curly hair, curled ends, ringlets, messy hair,
high ponytail, twin tails, hair ribbons, blunt straight fringe, hime cut,
short bangs,
teenager, schoolgirl, college student, childlike face,
brown hair, dark brown hair, chestnut hair, highlighted hair,
navy knit, green knit, blue top,
embroidery, logo on clothing, lettering on apron, printed apron,
bracelet, bangle, watch on right wrist, two watches,
second person, background person, someone in the background,
flat chest, boyish figure, skinny, bare skin, low neckline, open collar,
visible cleavage, skin-tight clothing, low camera angle, chest close-up,
suggestive pose, fanservice,
polka dots, patterned apron, bright red apron, floral print, loud pattern,
frilled apron, lace apron, apron with ribbons,
baggy shapeless clothing, cargo pants, rough hands, chapped skin, bandages,
long manicured nails, shabby clothes, poverty, squalor,
satin, silk, sheen, glossy fabric, lace, jewel tones, purple, navy blue,
saturated colours, bright accent colour,
brick wall, wooden farmhouse, rustic european cottage, stone floor, ivy,
hanging copper pots, open wooden shelving, western country kitchen,
dark wooden cabinets, electric coil stove, tiled plaster wall, lace curtain,
vintage kitchen, cluttered counter, subway tile, square wall tiles,
lattice window, sash window, pendant lamp, hanging utensils,
maid outfit, frills, pointed ears, wings, pale blue hair, school uniform,
heavy makeup, luxury interior, harsh flat lighting, blown-out highlights
```

**手について（基本プロンプトには入れない）**

節奈の手は**構図の話**であって、キャラクターデザインの要素ではない。基本シートに
「手のクローズアップを出せ」と書くと、それだけで一枚の情報量を食う。
**手を見せたい場面（料理・冷蔵庫・皿）を描くときに、その絵のプロンプトで指定する。**
根拠は正典の「ミリナには手がない」なので、**対比が要る絵でだけ効かせればいい。**

**終盤版**（第3章以降で差し替える）
```
Same character, later. Her hair is tied back far more often than it is worn
down, and the ends have lost their shine. The knit hangs looser at the
shoulders than it used to. Her makeup is lighter, and then absent. The nails
are still cut short, but the skin around them has gone dry.
The kitchen behind her is the same kitchen, with less in it.
The apron is the same apron, greyer and more worn.
The old gold watch is still on her wrist, still looked after.
She is still smiling.
```

> **終盤で残す2点**: エプロン（褪せる）と腕時計（褪せない）。
> **手放さないものがあることで、手放したものが見える。**
> 部屋は貧しくならない。**物が減るだけ。** 元から貧困ではないので、そこを間違えると別の話になる。

> ⚠ **ミリナの消耗（輪郭が粒に解ける）を彼女に適用しないこと。** 減り方を分けているのが設計。

**参照画像**
- 節奈は [`ref/setsuna_ref.png`](ref/setsuna_ref.png) / `ref/setsuna_ref_b.png` /
  `ref/setsuna_title.png`。ミリナと同じく、**生成のたびに参照として添える。**
- **感情違いは要らない。** 立ち絵を6種そろえていたのはゲームの都合で、
  小説に要るのは**その場面のための一枚**だけである。

---

## 実務メモ
- 章扉は**バストアップで止める**。全身にすると衣装の情報量が勝って、タイトル文字が置けない
- タイトルが長い（「そろそろ、行きませんか　——A Life, Unwritten」）ので、**上三分の一を空ける**
- 置き場所: 表紙 `ref/cover.png` ／ 章扉 `ref/act{n}.png`（`novel/ref/` に一本化している）
