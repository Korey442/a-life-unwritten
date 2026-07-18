from psd_tools import PSDImage
import os, json

EMOTIONS = {
    "neutral": {"eye":"開き", "mouth":"閉じ", "brow":"普通", "cheek":None},
    "happy":   {"eye":"笑い閉じ", "mouth":"開き", "brow":"にこり", "cheek":None},
    "angry":   {"eye":"ジト目", "mouth":"むっ閉じ", "brow":"怒り", "cheek":None},
    "sad":     {"eye":"逸らし", "mouth":"ほぼ閉じ", "brow":"困る", "cheek":None},
    "shy":     {"eye":"逸らし", "mouth":"わ", "brow":"困る", "cheek":"頬染め"},
    "surprise":{"eye":"丸目", "mouth":"お", "brow":"キリッ", "cheek":None},
}

COSTUMES = {
    "school": "女子学生1",
    "suit": "スーツ1",
    "nurse": "ナース",
    "kimono": "和服1",
    "dress": "ドレス",
}

def find_top(psd, key):
    for l in psd:
        if key in str(l.name):
            return l
    return None

def render(psd_path, conf, out_path):
    p = PSDImage.open(psd_path)
    g = find_top(p, "目")
    if g and g.is_group():
        for l in g: l.visible = conf["eye"] in str(l.name)
    g = find_top(p, "くち")
    if g and g.is_group():
        for l in g: l.visible = conf["mouth"] in str(l.name)
    g = find_top(p, "眉")
    if g and g.is_group():
        first = True
        for sub in g:
            if sub.is_group():
                sub.visible = first
                if first:
                    for c in sub: c.visible = conf["brow"] in str(c.name)
                    first = False
            else:
                sub.visible = False
    g = find_top(p, "顔色")
    if g and g.is_group():
        for l in g:
            n = str(l.name)
            if n == "頬色": l.visible = True
            elif conf["cheek"] and conf["cheek"] in n: l.visible = True
            else: l.visible = False
    img = p.composite()
    # ゲーム用に高さ720へ
    img.thumbnail((500, 720))
    img.save(out_path)
    return img.size

OUT = "/home/claude/game_assets/chars"
os.makedirs(OUT, exist_ok=True)
manifest = {}
for cos_key, cos_name in COSTUMES.items():
    src = f"コスチューム立ち絵/{cos_name}.psd"
    manifest[cos_key] = {}
    for emo, conf in EMOTIONS.items():
        out = f"{OUT}/{cos_key}_{emo}.png"
        sz = render(src, conf, out)
        manifest[cos_key][emo] = f"chars/{cos_key}_{emo}.png"
    print("done", cos_key, sz)
json.dump(manifest, open(f"/home/claude/game_assets/manifest.json","w"), ensure_ascii=False, indent=2)
print("manifest written")
