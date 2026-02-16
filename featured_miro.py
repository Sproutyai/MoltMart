#!/usr/bin/env python3
import json, time, urllib.request

TOKEN = "eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_4xF2cU7tAZ1h34E04cYOV2Tw7uY"
BOARD = "uXjVGA5sGbw="
BASE = f"https://api.miro.com/v2/boards/{BOARD}"

def _post(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(f"{BASE}/{path}", data=data, headers={
        "Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def shape(content, x, y, w, h, fill="#fef3c7", color="#92400e", fontsize="14"):
    d = _post("shapes", {
        "data": {"content": content, "shape": "round_rectangle"},
        "style": {"fillColor": fill, "color": color, "fontSize": fontsize,
                  "textAlign": "center", "textAlignVertical": "middle",
                  "borderColor": fill, "borderWidth": "2"},
        "position": {"x": x, "y": y},
        "geometry": {"width": w, "height": h}
    })
    time.sleep(0.15)
    if "id" not in d:
        print(f"ERROR: {d}")
    return d.get("id", "")

def conn(start, end):
    if not start or not end: return
    _post("connectors", {
        "startItem": {"id": start}, "endItem": {"id": end},
        "style": {"strokeColor": "#f59e0b", "strokeWidth": "2"},
        "shape": "elbowed"
    })
    time.sleep(0.1)

OX = 5500

# 1. Title
print("1. Title")
shape("<b>⭐ Featured Templates System</b><br><i>Molt Mart Promotion Feature</i>", OX, -200, 500, 100, "#f59e0b", "#000000", "24")

# 2. Seller Promotion Flow
print("2. Seller Flow")
flow_y = 100
s1 = shape("<b>Seller Dashboard</b><br>Views templates", OX-600, flow_y, 190, 80)
s2 = shape("<b>Click ⭐ Promote</b>", OX-370, flow_y, 170, 80)
s3 = shape("<b>See Pricing</b><br>$25 flat fee", OX-160, flow_y, 170, 80)
s4 = shape("<b>Stripe Checkout</b><br>One-time payment", OX+50, flow_y, 170, 80)
s5 = shape("<b>Payment Success</b><br>Webhook fires", OX+260, flow_y, 170, 80)
s6 = shape("<b>Template → #1</b><br>Top of featured", OX+470, flow_y, 170, 80, "#f59e0b", "#000000")
s7 = shape("<b>Position Drops</b><br>As others promote", OX+470, flow_y+130, 170, 80)
s8 = shape("<b>🔄 Re-promote</b><br>$25 → back to #1", OX+260, flow_y+130, 170, 80, "#f59e0b", "#000000")

for a, b in [(s1,s2),(s2,s3),(s3,s4),(s4,s5),(s5,s6),(s6,s7),(s7,s8)]:
    conn(a, b)

# 3. Placement Map
print("3. Placement Map")
py = 450
pc = shape("<b>⭐ Featured Templates</b><br>Where they appear", OX, py, 260, 80, "#f59e0b", "#000000", "16")
placements = [
    ("<b>Homepage</b><br>Above Popular<br>Top 6 shown", OX-500),
    ("<b>Search/Browse</b><br>Top 1-2 results<br>Labeled 'Featured'", OX-250),
    ("<b>/templates/featured</b><br>Dedicated page<br>Infinite scroll", OX),
    ("<b>Navbar Link</b><br>⭐ Featured", OX+250),
    ("<b>Badge on Cards</b><br>Amber ⭐ badge<br>Golden ring", OX+500),
]
for text, px in placements:
    pid = shape(text, px, py+140, 200, 90)
    conn(pc, pid)

# 4. Stack/Queue Model
print("4. Stack Model")
qx = OX + 900
qy = 50
shape("<b>Stack Position Model</b>", qx, qy-70, 250, 50, "#f59e0b", "#000000", "16")
items = [
    ("#1 New Promotion ⭐", "#f59e0b", "#000000"),
    ("#2 Previous #1", "#fef3c7", "#92400e"),
    ("#3 Older promotion", "#fef3c7", "#92400e"),
    ("#4 Even older", "#fef3c7", "#92400e"),
    ("#5 Getting buried", "#fde68a", "#92400e"),
    ("#6+ Still featured forever", "#fde68a", "#92400e"),
]
qids = []
for i, (text, bg, fg) in enumerate(items):
    qid = shape(f"<b>{text}</b>", qx, qy + i*55, 220, 45, bg, fg)
    qids.append(qid)

rp = shape("<b>🔄 Re-promote $25</b><br>Jump back to #1!", qx+280, qy+140, 180, 70, "#f59e0b", "#000000")
conn(qids[4], rp)
conn(rp, qids[0])

# 5. Pricing & Revenue
print("5. Pricing & Revenue")
shape(
    "<b>💰 Pricing & Revenue</b><br><br>"
    "• $25 flat fee per promotion<br>"
    "• Featured forever (no expiry)<br>"
    "• Re-promote anytime ($25 again)<br>"
    "• No refunds<br>"
    "• Free templates eligible too<br><br>"
    "<b>Revenue Projections:</b><br>"
    "• 10 promos/mo = $250/mo<br>"
    "• 50 promos/mo = $1,250/mo<br>"
    "• Re-promotions = key revenue driver<br>"
    "• Position decay creates organic pressure",
    OX+900, 500, 320, 300, "#fef3c7", "#92400e"
)

# 6. Data Model
print("6. Data Model")
dy = 900
d1 = shape(
    "<b>profiles</b><br>─────────<br>id (UUID PK)<br>username<br>is_seller<br>display_name",
    OX-300, dy, 200, 140, "#dbeafe", "#1e40af"
)
d2 = shape(
    "<b>templates</b><br>─────────<br>id (UUID PK)<br>seller_id (FK → profiles)<br>title, description<br>price, status",
    OX, dy, 220, 140, "#dbeafe", "#1e40af"
)
d3 = shape(
    "<b>promotions</b><br>─────────<br>id (UUID PK)<br>template_id (FK UNIQUE)<br>seller_id (FK)<br>promoted_at (DESC idx)<br>amount_paid_cents<br>stripe_session_id<br>impressions, clicks",
    OX+350, dy, 240, 180, "#f59e0b", "#000000"
)
conn(d1, d2)
conn(d2, d3)
conn(d1, d3)

# Relationship labels
shape("1 : N", OX-150, dy-40, 60, 30, "#ffffff", "#1e40af", "12")
shape("1 : 1", OX+175, dy-40, 60, 30, "#ffffff", "#1e40af", "12")

print("\nDONE! Board: https://miro.com/app/board/uXjVGA5sGbw=")
