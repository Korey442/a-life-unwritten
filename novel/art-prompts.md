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

## 実務メモ
- 章扉は**バストアップで止める**。全身にすると衣装の情報量が勝って、タイトル文字が置けない
- タイトルが長い（「そろそろ、行きませんか　——A Life, Unwritten」）ので、**上三分の一を空ける**
- 置き場所: 表紙 `assets/covers/cover.png` ／ 章扉 `assets/covers/act{n}.png`
