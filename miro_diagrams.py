#!/usr/bin/env python3
import urllib.request, urllib.error, json, time

TOKEN = "eyJtaXJvLm9yaWdpbiJ6ImV1MDEifQ_4xF2cU7tAZ1h34E04cYOV2Tw7uY"
BOARD = "uXjVGA5sGbw="
BASE = f"https://api.miro.com/v2/boards/{BOARD}"

def api(method, path, data=None):
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(f"{BASE}/{path}", data=body, method=method)
    req.add_header("Authorization", f"Bearer {TOKEN}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {e.read().decode()[:200]}")
        return {}

def shape(content, x, y, w, h, fill="#ffffff", color="#1a1a1a", border=None):
    time.sleep(0.2)
    d = api("POST", "shapes", {
        "data": {"content": content, "shape": "round_rectangle"},
        "style": {"fillColor": fill, "color": color, "fontSize": "14", "textAlign": "center", "textAlignVertical": "middle", "borderColor": border or fill, "borderWidth": "2.0", "borderOpacity": "1.0", "fillOpacity": "1.0"},
        "position": {"x": x, "y": y},
        "geometry": {"width": w, "height": h}
    })
    return d.get("id")

def connect(id1, id2, color="#000000"):
    if not id1 or not id2: return
    time.sleep(0.2)
    api("POST", "connectors", {
        "startItem": {"id": id1}, "endItem": {"id": id2},
        "style": {"strokeColor": color, "strokeWidth": "2.0"}
    })

BX = 3000

print("=== TITLE ===")
shape("<p><strong>🚚 TEMPLATE DELIVERY SYSTEM</strong></p><p>How templates flow from Molt Mart to users</p>", BX, -1800, 700, 120, "#FF8C00", "#ffffff")

# BUYER JOURNEY (BLUE)
print("=== BUYER JOURNEY ===")
BY = -1600
shape("<p><strong>🛒 BUYER JOURNEY</strong></p>", BX, BY, 500, 45, "#1a1a2e", "#ffffff")
BLUE = "#4262ff"
steps = ["Discover", "Preview", "Purchase", "Download", "Install", "Use"]
ids = []
for i, s in enumerate(steps):
    x = BX - 400 + i * 180
    ids.append(shape(f"<p><strong>{s}</strong></p>", x, BY+80, 150, 60, BLUE, "#ffffff"))
for i in range(len(ids)-1):
    connect(ids[i], ids[i+1], BLUE)

# SELLER JOURNEY (GREEN)
print("=== SELLER JOURNEY ===")
SY = -1400
shape("<p><strong>📦 SELLER JOURNEY</strong></p>", BX, SY, 500, 45, "#1a1a2e", "#ffffff")
GREEN = "#00b341"
steps2 = ["Create Template", "Upload to Molt Mart", "Publish Listing", "Earn Revenue"]
ids2 = []
for i, s in enumerate(steps2):
    x = BX - 250 + i * 200
    ids2.append(shape(f"<p><strong>{s}</strong></p>", x, SY+80, 170, 60, GREEN, "#ffffff"))
for i in range(len(ids2)-1):
    connect(ids2[i], ids2[i+1], GREEN)

# AGENT JOURNEY (PURPLE)
print("=== AGENT JOURNEY ===")
AY = -1200
shape("<p><strong>🤖 AGENT JOURNEY (Autonomous)</strong></p>", BX, AY, 500, 45, "#1a1a2e", "#ffffff")
PURPLE = "#7b2ff7"
steps3 = ["Need", "Search API", "Propose", "Approve", "Download", "Install", "Enhanced"]
ids3 = []
for i, s in enumerate(steps3):
    x = BX - 450 + i * 160
    ids3.append(shape(f"<p><strong>{s}</strong></p>", x, AY+80, 130, 60, PURPLE, "#ffffff"))
for i in range(len(ids3)-1):
    connect(ids3[i], ids3[i+1], PURPLE)

# SYSTEM ARCHITECTURE
print("=== SYSTEM ARCHITECTURE ===")
SAY = -950
shape("<p><strong>⚙️ SYSTEM ARCHITECTURE</strong></p>", BX, SAY, 500, 45, "#1a1a2e", "#ffffff")
ORANGE = "#FF6B35"
GRAY = "#636e72"

sa1 = shape("<p><strong>Molt Mart Website</strong></p><p>Next.js 14</p>", BX-300, SAY+100, 180, 70, ORANGE, "#ffffff")
sa2 = shape("<p><strong>Supabase</strong></p><p>Auth + DB + Storage</p>", BX, SAY+100, 180, 70, ORANGE, "#ffffff")
sa3 = shape("<p><strong>File Storage</strong></p><p>R2 / Supabase</p>", BX+300, SAY+100, 180, 70, ORANGE, "#ffffff")
sa4 = shape("<p><strong>.zip Download</strong></p><p>Signed URL</p>", BX+550, SAY+100, 160, 70, "#e17055", "#ffffff")
connect(sa1, sa2, ORANGE)
connect(sa2, sa3, ORANGE)
connect(sa3, sa4, ORANGE)

sa5 = shape("<p><strong>OpenClaw Agent</strong></p>", BX-300, SAY+220, 180, 70, PURPLE, "#ffffff")
sa6 = shape("<p><strong>Molt Mart API</strong></p><p>/api/templates/*</p>", BX, SAY+220, 180, 70, ORANGE, "#ffffff")
sa7 = shape("<p><strong>Template Files</strong></p><p>SOUL.md, AGENTS.md...</p>", BX+300, SAY+220, 180, 70, ORANGE, "#ffffff")
sa8 = shape("<p><strong>Workspace</strong></p><p>~/.openclaw/workspace</p>", BX+550, SAY+220, 180, 70, GRAY, "#ffffff")
connect(sa5, sa6, PURPLE)
connect(sa6, sa7, ORANGE)
connect(sa7, sa8, GRAY)
connect(sa2, sa6, "#aaaaaa")

# ZIP PACKAGE CONTENTS
print("=== ZIP PACKAGE ===")
ZY = -550
shape("<p><strong>📁 .ZIP PACKAGE CONTENTS</strong></p>", BX, ZY, 500, 45, "#1a1a2e", "#ffffff")
shape("<p><strong>template-name.zip</strong></p>", BX, ZY+170, 450, 280, "#ffeaa7", "#2d3436", "#d4a017")

files = [
    ("molt-mart.json", "(manifest)", "#fdcb6e"),
    ("SOUL.md", "(personality)", "#74b9ff"),
    ("AGENTS.md", "(rules)", "#74b9ff"),
    ("skills/ folder", "(capabilities)", "#a29bfe"),
    ("README.md", "(docs)", "#dfe6e9"),
    ("install.sh", "(installer)", "#55efc4"),
]
for i, (name, desc, clr) in enumerate(files):
    x = BX - 120 + (i % 2) * 240
    y = ZY + 80 + (i // 2) * 70
    shape(f"<p><strong>{name}</strong></p><p>{desc}</p>", x, y, 200, 55, clr, "#2d3436")

print("=== ALL DONE ===")
print(f"Created ~35 elements at X≈{BX}, Y from -1800 to -300")
