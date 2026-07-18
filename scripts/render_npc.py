from psd_tools import PSDImage
from PIL import Image
import base64, io, json

EMOTIONS = {
    "neutral": {"eye":"開き", "mouth":"閉じ", "brow":"普通", "cheek":None},
    "happy":   {"eye":"笑い閉じ", "mouth":"開き", "brow":"にこり", "cheek":None},
    "angry":   {"eye":"ジト目", "mouth":"むっ閉じ", "brow":"怒り", "cheek":None},
    "sad":     {"eye":"逸らし", "mouth":"ほぼ閉じ", "brow":"困る", "cheek":None},
    "shy":     {"eye":"逸らし", "mouth":"わ", "brow":"困る", "cheek":"頬染め"},
    "surprise":{"eye":"丸目", "mouth":"お", "brow":"キリッ", "cheek":None},
}
# NPC用に女子学生2(遥)と、老人枠にスーツ2を割当。既存school/suit等と別を用意。
NPC_COSTUMES = { "haruka": "女子学生3", "stranger": "ローブ" }

def find_top(psd, key):
    for l in psd:
        if key in str(l.name): return l
    return None
def render(psd_path, conf):
    p = PSDImage.open(psd_path)
    for cat,key in [("目","eye"),("くち","mouth")]:
        g=find_top(p,cat)
        if g and g.is_group():
            for l in g: l.visible = conf[key] in str(l.name)
    g=find_top(p,"眉")
    if g and g.is_group():
        first=True
        for sub in g:
            if sub.is_group():
                sub.visible=first
                if first:
                    for c in sub: c.visible = conf["brow"] in str(c.name)
                    first=False
            else: sub.visible=False
    g=find_top(p,"顔色")
    if g and g.is_group():
        for l in g:
            n=str(l.name)
            l.visible = (n=="頬色") or (conf["cheek"] and conf["cheek"] in n)
    img=p.composite(); img.thumbnail((300,440))
    alpha=img.split()[-1]; rgb=img.convert('RGB').quantize(colors=128,method=Image.FASTOCTREE).convert('RGBA'); rgb.putalpha(alpha)
    buf=io.BytesIO(); rgb.save(buf,'PNG',optimize=True)
    return base64.b64encode(buf.getvalue()).decode()

out={}
for npc,cos in NPC_COSTUMES.items():
    out[npc]={}
    for emo,conf in EMOTIONS.items():
        out[npc][emo]=render(f"コスチューム立ち絵/{cos}.psd",conf)
    print("done",npc,cos)
json.dump(out,open('/home/claude/npc_b64.json','w'))
tot=sum(len(v) for d in out.values() for v in d.values())
print("npc total:",round(tot/1024/1024,2),"MB")
