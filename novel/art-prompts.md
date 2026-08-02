# 絵のプロンプト（表紙・章扉）

**ミリナの容姿は既存の立ち絵が正**。`assets/chars/npc_milina_neutral.png` を
image-to-image かキャラ参照として**必ず添えること**。文章だけだと別人が出る。

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

## 九条 節奈——キャラクターデザイン

**参照画像は `ref/setsuna_ref.png`（三稿）。これが正。** 生成時は必ず添えること。
文章だけだと別人が出るのは、ミリナと同じ。設定は `../STORY.md`「容姿」。

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

**本体は 2,707 字**（上限4,000字）。ネガティブは別欄なので字数に含めない。
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

HAIR — long, straight, glossy black hair to mid-back, visibly well cared for.
A soft side-swept fringe, long strands framing the face. No waves, no curls.

FIGURE — about 160cm, a soft, gently rounded adult figure, womanly waist and
hips. Warm and enveloping. Motherly, NOT sexualised — do not exaggerate the
chest, no clinging fabric, no cleavage.

CLOTHES — a greige ribbed cotton knit with a wide round neck, sleeves pushed up
to mid-forearm. Over it a plain undyed off-white cotton apron with a chest bib,
one front pocket and soft fabric ties at the waist — washed soft, never crisp,
never starched. Dark brown trousers. No frills, no lace, no ribbons, no print,
no pattern of any kind. The apron must not be the loudest thing in the picture.

WATCH — a slim gold wristwatch with a small round face on her left wrist,
plainly older and finer than anything else she owns, and plainly looked after.
The only metallic glint in the frame.

COLOUR — ON THE CLOTHING ONLY, low saturation, warm and muted: apron undyed
off-white #EDE6DA, knit greige #C9B7A6, trousers dark brown #4A3B32.
No jewel tones, no purple, no navy, no bright accent colour.
These colours MUST NOT reach the background.

FABRIC — everything she wears absorbs light rather than reflecting it: matte
low-gauge ribbed cotton knit, plain-weave linen-cotton apron. No satin, no silk.

SETTING — a modern Japanese system kitchen. Functional, clean and simple:
flat handleless cabinet doors in white or pale wood, one uninterrupted worktop,
a stainless two-burner GAS hob, a wide flat sink, a slim rangehood.
Uncluttered, tidy, well kept. No dark wood country cabinets, no open wooden
shelving, no hanging pots, no tiled plaster wall, nothing rustic or vintage.

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
huge breasts, breast emphasis, cleavage, tight clinging top,
polka dots, patterned apron, bright red apron, floral print, loud pattern,
frilled apron, lace apron, apron with ribbons,
baggy shapeless clothing, cargo pants, rough hands, chapped skin, bandages,
long manicured nails, shabby clothes, poverty, squalor,
satin, silk, sheen, glossy fabric, lace, jewel tones, purple, navy blue,
saturated colours, bright accent colour,
brick wall, wooden farmhouse, rustic european cottage, stone floor, ivy,
hanging copper pots, open wooden shelving, western country kitchen,
dark wooden cabinets, electric coil stove, tiled plaster wall, lace curtain,
vintage kitchen, cluttered counter,
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

**立ち絵（ゲーム側）**
- 命名は `assets/chars/npc_setsuna_{emotion}.png`、感情は6種固定
  （`neutral|happy|angry|sad|shy|surprise`）。
- **未確認**: 既存の立ち絵は「立ち絵さん（キャラクター作成セット）」由来。日焼け肌・黒髪の
  まとめ髪・**手が見える構図**がそのキットで作れるかは確認していない。作れない場合は
  節奈だけ別手段になる（`scripts/render_npc.py` の前提が変わる）。
- 未使用の `npc_haruka_*.png`（6枚）は glob 取り込みでビルドに乗ったままなので、
  節奈を入れるときに一緒に消す。

---

## 実務メモ
- 章扉は**バストアップで止める**。全身にすると衣装の情報量が勝って、タイトル文字が置けない
- タイトルが長い（「そろそろ、行きませんか　——A Life, Unwritten」）ので、**上三分の一を空ける**
- 置き場所: 表紙 `assets/covers/cover.png` ／ 章扉 `assets/covers/act{n}.png`
