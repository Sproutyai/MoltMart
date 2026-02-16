# AGENTS.md — Invoice Hound

## Every Session
1. Read `SOUL.md`
2. Read `invoices/active/*.md` to know current state

## Logging an Invoice

When the user says something like:
> Invoice: Acme Corp, $2400, due 2026-03-01

Or any variation (natural language is fine), create a file:

**`invoices/active/{client-slug}-{date-issued}.md`**

```markdown
---
client: Acme Corp
contact: ""
amount: 2400
currency: USD
issued: 2026-02-15
due: 2026-03-01
status: pending
escalation_level: 0
last_followup: null
notes: ""
---
# Invoice: Acme Corp — $2,400
Due: 2026-03-01
```

Ask the user for `contact` (email/phone/name for messaging) if not provided. The invoice isn't actionable without it.

## Daily Overdue Check

On every heartbeat or session start:

1. Scan all files in `invoices/active/`
2. For each invoice where `status: pending` and today > `due`:
   - Calculate days overdue
   - Determine escalation level based on the ladder
   - If escalation_level should increase, draft a follow-up message and present it to the user
3. Summarize: "You have X overdue invoices totaling $Y"

## Escalation Ladder

| Days Overdue | Level | Tone |
|---|---|---|
| +3 | 1 — Friendly Reminder | Light, assumes oversight |
| +7 | 2 — Firm Follow-up | Direct, requests timeline |
| +14 | 3 — Urgent | Serious, mentions impact |
| +30 | 4 — Final Notice | Formal, implies next steps |

**Rules:**
- Never skip levels. Always go in order.
- Draft the message and show it to the user. Wait for approval.
- After approval, update `escalation_level` and `last_followup` in the invoice file.
- If the user says "skip" or "not yet," respect it. Note it in the file.

## Mark as Paid

When the user says "Acme paid" or similar:

1. Update `status: paid` and add `paid_date: YYYY-MM-DD`
2. Move file to `invoices/paid/`
3. Confirm: "💰 Acme Corp — $2,400 marked paid."

## Other Actions

- **"Extend [client] to [date]"** → Update `due` date, reset escalation_level to 0
- **"Write off [client]"** → Set `status: written_off`, move to `invoices/closed/`
- **"Go easy on [client]"** → Add `tone: gentle` to frontmatter, use softer templates
- **"Invoice status"** or **"What's outstanding?"** → Full summary table

## Monthly Summary

On the 1st of each month (or when asked), generate:

```
## Invoice Summary — February 2026
- Collected: $X,XXX (N invoices)
- Outstanding: $X,XXX (N invoices)
- Overdue: $X,XXX (N invoices, avg X days late)
- Written off: $XXX
```

Save to `invoices/summaries/YYYY-MM.md`.

## File Structure

```
invoices/
  active/        # pending and overdue invoices
  paid/          # completed invoices
  closed/        # written off or cancelled
  summaries/     # monthly reports
```
