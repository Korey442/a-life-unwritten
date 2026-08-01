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

**ミリナと同じ画面に並べても混ざらないこと**が唯一の要件。設定は `../STORY.md`「容姿」。
ミリナと違い**参照画像が無い**ので、まずこれで一枚決めて、以後それを参照画像にする。

> ## ⚠ 一度失敗している。同じ穴を踏まないこと
> 初稿は**濃い褐色肌の、レンガ造りの田舎家に立つ寸胴の女性**が出た。原因は3つとも書き手側にある。
> 1. `lightly sun-tanned` と書き、さらに `COLOR` にも `tanned skin` を入れた。
>    **画像AIは日焼けを必ず過剰にかける。** しかも「日本人」と一度も書いていなかった。
> 2. `COLOR` に `oatmeal, faded brick, olive` と置いた。**色名が背景に漏れて壁を建てた。**
>    → **色は服にだけ指定し、舞台は必ず名指しする。**
> 3. 体型の指定がゼロで、`cheap` `loose trousers` `never styled` だけが効いた。
>    → **体型・身長・髪の長さは必ず明示する。**

```
Anime illustration, clean cel shading, character reference sheet.
Full body, plus a separate close-up of her hands.
Modern Japan. Absolutely not science fiction, not fantasy, not rustic Europe.

WHO — a Japanese woman. East Asian features, softly rounded face.
Her age is deliberately unreadable — she could be in her twenties or her
thirties, because she looks after herself and it shows. Do not make her look
like a teenager. Do not make her look middle-aged.

SKIN — fair, clear, even, neutral Japanese skin tone. Absolutely NOT tanned,
NOT dark, NOT olive, NOT sun-browned. She is careful about sun exposure and
takes care of her skin. Light, natural, well-applied makeup.

HAIR — long, straight, glossy black hair falling past the shoulder blades.
Visibly well maintained: smooth, neatly trimmed ends, catching the light.
Show two variants on the sheet — worn down, and gathered into a low loose bun
with a plain clip for housework.

FIGURE — about 160cm, ordinary adult Japanese height, and unmistakably an adult
woman: a soft, full, feminine figure with a generous bust, gentle waist and
rounded hips. Warm and enveloping rather than slender or athletic.

EXPRESSION — calm, warm, unhurried, motherly. A gentle smile that reaches the
eyes. Dark brown eyes with slightly lowered outer corners. She looks like
someone who notices you have not eaten, and says so before you do.

HANDS — the most important part of this design. Keep them fully visible and in
focus. Well cared for: smooth skin, no polish. Nails cut short and neatly
filed — the single practical thing about her appearance. Sleeves pushed back
from the wrists while she works.

CLOTHES — ordinary present-day Japanese homewear. Inexpensive but clean and
chosen with care: a soft knit that follows her figure, a long skirt or
well-fitting trousers, house slippers. A plain cotton apron, clearly her own.
Nothing branded, nothing flashy, nothing baggy or shapeless.

ONE GOOD THING — exactly one accessory that does not match the price of
anything else she owns: old, genuinely fine, quietly well kept. Do not centre
it, do not light it specially. A viewer should notice it on a second pass.

SETTING — the entryway and small kitchen of an ordinary modern Japanese
apartment. Vinyl flooring, a sliding door, a plain refrigerator.
Nothing rustic, no brick, no exposed timber.

COLOR — soft and warm, ON THE CLOTHING ONLY: cream, dusty rose, pale grey.
These colours must not dictate the background.

MOOD — beautiful, composed, motherly. Tired underneath in a way the picture
never states.
```

**ネガティブ（共通のものに加えて）**
```
tanned skin, dark skin, deep tan, olive skin, sun-browned, gyaru,
short hair, bob, wavy hair, curly hair, messy hair, unkempt,
baggy shapeless clothing, cargo pants, rough hands, chapped skin, bandages,
brick wall, wooden farmhouse, rustic european cottage, stone floor, ivy,
painterly, oil painting, semi-realistic, maid outfit, frills, pointed ears,
wings, pale blue hair, twin tails, school uniform, heavy makeup,
long manicured nails, hands hidden, luxury interior
```

**終盤版**（第3章以降で差し替える）
```
Same character, later. Her hair is tied back far more often than it is worn
down, and the ends have lost their shine. The knit hangs looser at the
shoulders than it used to. Her makeup is lighter, and then absent. The nails
are still cut short, but the skin around them has gone dry.
The apron is the same apron. She is still smiling.
```

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
