#!/bin/bash
TOKEN="eyJtaXJvLm9yaWdpbiI6ImV1MDEifQ_4xF2cU7tAZ1h34E04cYOV2Tw7uY"
BOARD="uXjVGA5sGbw="
BASE="https://api.miro.com/v2/boards/$BOARD"
H1="Authorization: Bearer $TOKEN"
H2="Content-Type: application/json"

create_shape() {
  local content="$1" x="$2" y="$3" w="$4" h="$5" fill="$6" font="$7" fontsize="${8:-14}"
  resp=$(curl -s -X POST "$BASE/shapes" -H "$H1" -H "$H2" -d "{
    \"data\":{\"content\":\"$content\",\"shape\":\"round_rectangle\"},
    \"style\":{\"fillColor\":\"$fill\",\"fontColor\":\"$font\",\"fontSize\":\"$fontsize\",\"textAlign\":\"center\",\"textAlignVertical\":\"middle\",\"borderColor\":\"$fill\",\"borderWidth\":\"2\"},
    \"position\":{\"x\":$x,\"y\":$y},
    \"geometry\":{\"width\":$w,\"height\":$h}
  }")
  echo "$resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id','ERROR'))" 2>/dev/null
}

create_connector() {
  local startId="$1" endId="$2"
  curl -s -X POST "$BASE/connectors" -H "$H1" -H "$H2" -d "{
    \"startItem\":{\"id\":\"$startId\"},
    \"endItem\":{\"id\":\"$endId\"},
    \"style\":{\"strokeColor\":\"#f59e0b\",\"strokeWidth\":\"2\"},
    \"shape\":\"elbowed\"
  }" > /dev/null
}

# Starting X offset
OX=5500

echo "=== 1. Title Header ==="
create_shape "<b>⭐ Featured Templates System</b><br>Molt Mart Promotion Feature" $OX -200 500 100 "#f59e0b" "#000000" 24

echo ""
echo "=== 2. Seller Promotion Flow ==="
echo "--- Row at Y=100 ---"
S1=$(create_shape "<b>Seller Dashboard</b><br>Views templates" $((OX-600)) 100 200 80 "#fef3c7" "#92400e")
S2=$(create_shape "<b>Click ⭐ Promote</b>" $((OX-350)) 100 180 80 "#fef3c7" "#92400e")
S3=$(create_shape "<b>See Pricing</b><br>\$25 flat fee" $((OX-120)) 100 180 80 "#fef3c7" "#92400e")
S4=$(create_shape "<b>Stripe Checkout</b><br>One-time payment" $((OX+110)) 100 180 80 "#fef3c7" "#92400e")
S5=$(create_shape "<b>Payment Success</b><br>Webhook fires" $((OX+340)) 100 180 80 "#fef3c7" "#92400e")
S6=$(create_shape "<b>Template → #1</b><br>Top of featured" $((OX+570)) 100 180 80 "#f59e0b" "#000000")
echo "--- Row at Y=250 ---"
S7=$(create_shape "<b>Position Drops</b><br>As others promote" $((OX+570)) 250 180 80 "#fef3c7" "#92400e")
S8=$(create_shape "<b>Re-promote</b><br>\$25 → back to #1" $((OX+340)) 250 180 80 "#f59e0b" "#000000")

create_connector "$S1" "$S2"
create_connector "$S2" "$S3"
create_connector "$S3" "$S4"
create_connector "$S4" "$S5"
create_connector "$S5" "$S6"
create_connector "$S6" "$S7"
create_connector "$S7" "$S8"

echo ""
echo "=== 3. Placement Map ==="
PY=500
PC=$(create_shape "<b>⭐ Featured Templates</b><br>Where they appear" $OX $PY 250 80 "#f59e0b" "#000000" 16)
P1=$(create_shape "<b>Homepage</b><br>Above Popular section<br>Top 6 shown" $((OX-500)) $((PY+150)) 200 90 "#fef3c7" "#92400e")
P2=$(create_shape "<b>Search/Browse</b><br>Top 1-2 results<br>Labeled 'Featured'" $((OX-250)) $((PY+150)) 200 90 "#fef3c7" "#92400e")
P3=$(create_shape "<b>/templates/featured</b><br>Dedicated page<br>Infinite scroll" $OX $((PY+150)) 200 90 "#fef3c7" "#92400e")
P4=$(create_shape "<b>Navbar Link</b><br>⭐ Featured" $((OX+250)) $((PY+150)) 200 90 "#fef3c7" "#92400e")
P5=$(create_shape "<b>Badge on Cards</b><br>Amber ⭐ badge<br>Golden ring border" $((OX+500)) $((PY+150)) 200 90 "#fef3c7" "#92400e")

create_connector "$PC" "$P1"
create_connector "$PC" "$P2"
create_connector "$PC" "$P3"
create_connector "$PC" "$P4"
create_connector "$PC" "$P5"

echo ""
echo "=== 4. Stack/Queue Model ==="
QX=$((OX+900))
QY=100
create_shape "<b>Stack Position Model</b>" $QX $((QY-80)) 250 60 "#f59e0b" "#000000" 16

Q1=$(create_shape "<b>#1</b> New Promotion ⭐" $QX $QY 220 50 "#f59e0b" "#000000")
Q2=$(create_shape "<b>#2</b> Previous #1" $QX $((QY+60)) 220 50 "#fef3c7" "#92400e")
Q3=$(create_shape "<b>#3</b> Older promotion" $QX $((QY+120)) 220 50 "#fef3c7" "#92400e")
Q4=$(create_shape "<b>#4</b> Even older" $QX $((QY+180)) 220 50 "#fef3c7" "#92400e")
Q5=$(create_shape "<b>#5</b> Getting buried" $QX $((QY+240)) 220 50 "#fde68a" "#92400e")
Q6=$(create_shape "<b>#6+</b> Still featured forever" $QX $((QY+300)) 220 50 "#fde68a" "#92400e")

# Re-promote arrow label
RP=$(create_shape "<b>🔄 Re-promote \$25</b><br>Jump back to #1!" $((QX+280)) $((QY+150)) 180 70 "#f59e0b" "#000000")
create_connector "$Q5" "$RP"
create_connector "$RP" "$Q1"

echo ""
echo "=== 5. Pricing & Revenue ==="
RX=$((OX+900))
RY=550
create_shape "<b>💰 Pricing & Revenue</b><br><br>• \$25 flat fee per promotion<br>• Featured forever (no expiry)<br>• Re-promote anytime (\$25 again)<br>• No refunds<br>• Free templates can promote too<br><br><b>Revenue Projections:</b><br>• 10 promos/month = \$250/mo<br>• 50 promos/month = \$1,250/mo<br>• Re-promotions are key driver<br>• Position decay → organic pressure" $RX $RY 320 280 "#fef3c7" "#92400e"

echo ""
echo "=== 6. Data Model ==="
DX=$OX
DY=950
D1=$(create_shape "<b>profiles</b><br>─────────<br>id (UUID PK)<br>username<br>is_seller<br>display_name" $((DX-300)) $DY 200 140 "#dbeafe" "#1e40af")
D2=$(create_shape "<b>templates</b><br>─────────<br>id (UUID PK)<br>seller_id (FK)<br>title, description<br>price, status" $DX $DY 200 140 "#dbeafe" "#1e40af")
D3=$(create_shape "<b>promotions</b><br>─────────<br>id (UUID PK)<br>template_id (FK UNIQUE)<br>seller_id (FK)<br>promoted_at (DESC idx)<br>amount_paid_cents<br>stripe_session_id<br>impressions, clicks" $((DX+350)) $DY 240 180 "#f59e0b" "#000000")

create_connector "$D1" "$D2"
create_connector "$D2" "$D3"
create_connector "$D1" "$D3"

# Labels for relationships
create_shape "1:N" $((DX-150)) $((DY-30)) 50 30 "#ffffff" "#1e40af" 12
create_shape "1:1" $((DX+175)) $((DY-30)) 50 30 "#ffffff" "#1e40af" 12
create_shape "1:N" $((DX+25)) $((DY+100)) 50 30 "#ffffff" "#1e40af" 12

echo ""
echo "=== DONE ==="
echo "Board: https://miro.com/app/board/uXjVGA5sGbw="
