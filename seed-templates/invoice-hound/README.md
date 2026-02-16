# 🐕 Invoice Hound

**Never chase a payment manually again.**

---

## The Problem

You finished the work. You sent the invoice. And then... silence.

Every freelancer knows this: following up on late payments is awkward, time-consuming, and easy to procrastinate on. You tell yourself you'll send that reminder tomorrow. Tomorrow becomes next week. Next week becomes "I guess I'm just not getting paid."

Meanwhile, your rent is due.

## The Solution

Invoice Hound tracks every outstanding invoice and handles follow-up on autopilot. Tell it about an invoice, and it will:

1. **Track it** — stores the invoice with client, amount, and due date
2. **Watch it** — checks daily for overdue invoices
3. **Escalate it** — drafts progressively firmer follow-up messages on a proven schedule
4. **Wait for you** — every message is drafted for your approval, never sent automatically
5. **Celebrate it** — marks invoices paid and tracks your collection rate

## How It Works

```
You:     Invoice: Acme Corp, $2400, due March 1
Hound:   ✅ Logged. Acme Corp — $2,400, due Mar 1.
         What's the best contact for Acme? (email/phone)

You:     jane@acmecorp.com
Hound:   Got it. I'll start reminders if it goes overdue.

--- March 4 (3 days overdue) ---

Hound:   🔔 Acme Corp — $2,400 is 3 days overdue.
         Here's a friendly reminder draft:

         "Hi Jane, Hope you're doing well! Just a quick note —
         invoice for $2,400 was due on March 1. Wanted to make
         sure it didn't slip through the cracks..."

         Send it, edit it, or skip?

You:     Send it.
Hound:   ✉️ Sent to jane@acmecorp.com.

--- March 12 ---

You:     Acme paid!
Hound:   💰 Acme Corp — $2,400 marked paid. Nice.
```

## Escalation Schedule

| When | What | Tone |
|---|---|---|
| Due date + 3 days | Friendly reminder | "Just making sure this didn't slip through" |
| Due date + 7 days | Firm follow-up | "Could you let me know when to expect payment?" |
| Due date + 14 days | Urgent notice | "This is affecting my cash flow" |
| Due date + 30 days | Final notice | "I'll need to explore other options" |

Every message is drafted for your review first. You're always in control.

## Install

1. Copy this template's files into your OpenClaw workspace
2. The key files:
   - `SOUL.md` — Invoice Hound's personality
   - `AGENTS.md` — Workflow and escalation rules
   - `TOOLS.md` — Messaging configuration
   - `skills/invoice-tracker.md` — Templates and detailed instructions
3. Create the invoice directories:
   ```
   mkdir -p invoices/active invoices/paid invoices/closed invoices/summaries
   ```
4. Configure your messaging channel (WhatsApp, email, or use manual copy-paste)
5. Start logging invoices!

## Requirements

- OpenClaw running
- A messaging channel configured (optional — you can always copy-paste drafts manually)
- That's it

## Commands

| Say This | Does This |
|---|---|
| `Invoice: [client], $[amount], due [date]` | Log a new invoice |
| `What's outstanding?` | See all active invoices |
| `[Client] paid` | Mark invoice as paid |
| `Extend [client] to [date]` | Push back the deadline |
| `Go easy on [client]` | Use gentler follow-up tone |
| `Write off [client]` | Close as uncollectable |

---

*Built for freelancers who'd rather do the work than chase the money.*
