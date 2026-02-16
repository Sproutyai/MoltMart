#!/bin/bash
TOKEN="eyJtaXJvLm9yaWdpbiJ6ImV1MDEifQ_4xF2cU7tAZ1h34E04cYOV2Tw7uY"
BOARD="uXjVGA5sGbw="
BASE="https://api.miro.com/v2/boards/$BOARD"
H1="Authorization: Bearer $TOKEN"
H2="Content-Type: application/json"

# Helper to create shape and capture ID
create_shape() {
  local content="$1" x="$2" y="$3" w="$4" h="$5" fill="$6" font="$7"
  resp=$(curl -s -X POST "$BASE/shapes" -H "$H1" -H "$H2" -d "{
    \"data\":{\"content\":\"$content\",\"shape\":\"round_rectangle\"},
    \"style\":{\"fillColor\":\"$fill\",\"fontColor\":\"$font\",\"fontSize\":\"14\",\"textAlign\":\"center\",\"textAlignVertical\":\"middle\"},
    \"position\":{\"x\":$x,\"y\":$y},
    \"geometry\":{\"width\":$w,\"height\":$h}
  }")
  echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id','ERROR'))"
}

create_connector() {
  local start="$1" end="$2" color="$3"
  curl -s -X POST "$BASE/connectors" -H "$H1" -H "$H2" -d "{
    \"startItem\":{\"id\":\"$start\"},
    \"endItem\":{\"id\":\"$end\"},
    \"style\":{\"strokeColor\":\"$color\",\"strokeWidth\":\"2\"},
    \"captions\":[]
  }" > /dev/null
}

BX=3000  # base X offset

echo "=== SECTION TITLE ==="
TITLE=$(create_shape "<p><strong>🚚 TEMPLATE DELIVERY SYSTEM</strong></p><p>How templates get from Molt Mart to users</p>" $BX -1800 600 100 "#FF8C00" "#ffffff")
echo "Title: $TITLE"

# ===================== BUYER JOURNEY (BLUE) =====================
echo "=== BUYER JOURNEY ==="
BY=-1600
create_shape "<p><strong>🛒 BUYER JOURNEY</strong></p>" $BX $BY 500 50 "#1a1a2e" "#ffffff" > /dev/null

BLUE="#4262ff"
steps=("Discover" "Preview" "Purchase" "Download" "Install" "Use")
BUYER_IDS=()
for i in "${!steps[@]}"; do
  x=$(( BX - 400 + i * 180 ))
  id=$(create_shape "<p><strong>${steps[$i]}</strong></p>" $x $(( BY + 80 )) 150 60 "$BLUE" "#ffffff")
  BUYER_IDS+=("$id")
  echo "  Buyer ${steps[$i]}: $id"
done
for i in $(seq 0 4); do
  create_connector "${BUYER_IDS[$i]}" "${BUYER_IDS[$((i+1))]}" "$BLUE"
done

# ===================== SELLER JOURNEY (GREEN) =====================
echo "=== SELLER JOURNEY ==="
SY=-1400
create_shape "<p><strong>📦 SELLER JOURNEY</strong></p>" $BX $SY 500 50 "#1a1a2e" "#ffffff" > /dev/null

GREEN="#00b341"
steps2=("Create" "Upload" "Publish" "Earn")
SELLER_IDS=()
for i in "${!steps2[@]}"; do
  x=$(( BX - 200 + i * 200 ))
  id=$(create_shape "<p><strong>${steps2[$i]}</strong></p>" $x $(( SY + 80 )) 150 60 "$GREEN" "#ffffff")
  SELLER_IDS+=("$id")
  echo "  Seller ${steps2[$i]}: $id"
done
for i in $(seq 0 2); do
  create_connector "${SELLER_IDS[$i]}" "${SELLER_IDS[$((i+1))]}" "$GREEN"
done

# ===================== AGENT JOURNEY (PURPLE) =====================
echo "=== AGENT JOURNEY ==="
AY=-1200
create_shape "<p><strong>🤖 AGENT JOURNEY</strong></p>" $BX $AY 500 50 "#1a1a2e" "#ffffff" > /dev/null

PURPLE="#7b2ff7"
steps3=("Need" "Search API" "Propose" "Approve" "Download" "Install" "Enhanced")
AGENT_IDS=()
for i in "${!steps3[@]}"; do
  x=$(( BX - 450 + i * 160 ))
  id=$(create_shape "<p><strong>${steps3[$i]}</strong></p>" $x $(( AY + 80 )) 130 60 "$PURPLE" "#ffffff")
  AGENT_IDS+=("$id")
  echo "  Agent ${steps3[$i]}: $id"
done
for i in $(seq 0 5); do
  create_connector "${AGENT_IDS[$i]}" "${AGENT_IDS[$((i+1))]}" "$PURPLE"
done

# ===================== SYSTEM ARCHITECTURE (ORANGE) =====================
echo "=== SYSTEM ARCHITECTURE ==="
SAY=-950
create_shape "<p><strong>⚙️ SYSTEM ARCHITECTURE</strong></p>" $BX $SAY 500 50 "#1a1a2e" "#ffffff" > /dev/null

ORANGE="#FF6B35"
GRAY="#2d3436"

# Top row: Website -> Supabase -> Storage -> .zip
SA1=$(create_shape "<p><strong>Molt Mart</strong></p><p>Next.js Website</p>" $(( BX - 300 )) $(( SAY + 100 )) 180 70 "$ORANGE" "#ffffff")
SA2=$(create_shape "<p><strong>Supabase</strong></p><p>Auth + DB</p>" $(( BX )) $(( SAY + 100 )) 180 70 "$ORANGE" "#ffffff")
SA3=$(create_shape "<p><strong>Storage</strong></p><p>R2 / Supabase</p>" $(( BX + 300 )) $(( SAY + 100 )) 180 70 "$ORANGE" "#ffffff")
SA4=$(create_shape "<p><strong>.zip Download</strong></p>" $(( BX + 550 )) $(( SAY + 100 )) 150 70 "#e17055" "#ffffff")

create_connector "$SA1" "$SA2" "$ORANGE"
create_connector "$SA2" "$SA3" "$ORANGE"
create_connector "$SA3" "$SA4" "$ORANGE"

# Bottom row: Agent -> API -> Template Files -> Workspace
SA5=$(create_shape "<p><strong>OpenClaw Agent</strong></p>" $(( BX - 300 )) $(( SAY + 220 )) 180 70 "$PURPLE" "#ffffff")
SA6=$(create_shape "<p><strong>Molt Mart API</strong></p><p>/api/templates</p>" $(( BX )) $(( SAY + 220 )) 180 70 "$ORANGE" "#ffffff")
SA7=$(create_shape "<p><strong>Template Files</strong></p>" $(( BX + 300 )) $(( SAY + 220 )) 180 70 "$ORANGE" "#ffffff")
SA8=$(create_shape "<p><strong>~/.openclaw/workspace</strong></p>" $(( BX + 550 )) $(( SAY + 220 )) 180 70 "$GRAY" "#ffffff")

create_connector "$SA5" "$SA6" "$PURPLE"
create_connector "$SA6" "$SA7" "$ORANGE"
create_connector "$SA7" "$SA8" "$GRAY"
create_connector "$SA2" "$SA6" "#666666"

echo "  Arch items done"

# ===================== ZIP PACKAGE CONTENTS =====================
echo "=== ZIP PACKAGE ==="
ZY=-550
create_shape "<p><strong>📁 .ZIP PACKAGE CONTENTS</strong></p>" $BX $ZY 500 50 "#1a1a2e" "#ffffff" > /dev/null

# Big container shape
create_shape "<p><strong>template-name.zip</strong></p>" $(( BX )) $(( ZY + 150 )) 400 250 "#ffeaa7" "#2d3436" > /dev/null

files=("molt-mart.json" "SOUL.md" "AGENTS.md" "skills/ folder" "README.md" "install.sh")
colors=("#fdcb6e" "#74b9ff" "#74b9ff" "#a29bfe" "#dfe6e9" "#55efc4")
for i in "${!files[@]}"; do
  x=$(( BX - 100 + (i % 2) * 200 ))
  y=$(( ZY + 80 + (i / 2) * 60 ))
  create_shape "<p>${files[$i]}</p>" $x $y 170 45 "${colors[$i]}" "#2d3436" > /dev/null
done

echo "=== DONE ==="
echo "All diagrams placed at X≈$BX, Y from -1800 to -400"
