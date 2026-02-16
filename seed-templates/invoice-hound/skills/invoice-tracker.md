# Skill: Invoice Tracker

## Invoice File Format

Each invoice is a markdown file with YAML frontmatter stored in `invoices/active/`.

**Filename:** `{client-slug}-{issued-date}.md` (e.g., `acme-corp-2026-02-15.md`)

```yaml
---
client: "Acme Corp"
contact: "+1234567890"
amount: 2400
currency: USD
issued: 2026-02-15
due: 2026-03-01
status: pending           # pending | paid | written_off | cancelled
escalation_level: 0       # 0=none, 1=friendly, 2=firm, 3=urgent, 4=final
last_followup: null        # date of last sent follow-up
tone: default              # default | gentle | direct
notes: "Net-30, project was website redesign"
---
# Invoice: Acme Corp — $2,400.00
Issued: 2026-02-15 | Due: 2026-03-01
```

## Escalation Message Templates

### Level 1 — Friendly Reminder (+3 days overdue)

> Hi [Client Name],
>
> Hope you're doing well! Just a quick note — invoice #[ref] for $[amount] was due on [due date]. Wanted to make sure it didn't slip through the cracks.
>
> Happy to resend the invoice if that's helpful. Let me know if you have any questions.
>
> Thanks,
> [Your Name]

### Level 2 — Firm Follow-up (+7 days overdue)

> Hi [Client Name],
>
> Following up on invoice #[ref] for $[amount], which was due on [due date]. It's now [X] days past due.
>
> Could you let me know when I can expect payment, or if there's anything holding things up on your end?
>
> Thanks,
> [Your Name]

### Level 3 — Urgent (+14 days overdue)

> Hi [Client Name],
>
> I wanted to reach out again regarding invoice #[ref] for $[amount], now [X] days overdue. I understand things can get busy, but this is affecting my cash flow and I need to get this resolved.
>
> Please let me know the status of this payment at your earliest convenience.
>
> Thank you,
> [Your Name]

### Level 4 — Final Notice (+30 days overdue)

> Hi [Client Name],
>
> This is a final notice regarding invoice #[ref] for $[amount], originally due [due date] — now [X] days past due.
>
> I'd like to resolve this directly. If I don't hear back by [date +7 days], I'll need to explore other options for collecting this payment.
>
> Please get in touch.
>
> Regards,
> [Your Name]

## Tone Adjustments

When `tone: gentle` is set on an invoice:
- Level 1: Even lighter, more "just checking in" energy
- Level 2: Frame as "I know things are busy" rather than demanding a timeline
- Level 3: Express concern rather than urgency — "I want to make sure everything is okay"
- Level 4: Still firm, but frame as "let's figure this out together"

When `tone: direct` is set:
- Skip pleasantries. Get to the point faster.
- Level 1 reads more like a standard Level 2.
- Shorten all messages by ~30%.

## Actions

### Mark as Paid
```
User: "Acme paid" / "Got payment from Acme" / "Acme Corp $2400 paid"
→ Set status: paid, paid_date: today
→ Move to invoices/paid/
→ Confirm with amount
```

### Extend Deadline
```
User: "Extend Acme to March 15" / "Give Acme another week"
→ Update due date
→ Reset escalation_level to 0
→ Add note: "Deadline extended from [old] to [new]"
```

### Write Off
```
User: "Write off Acme" / "Not gonna collect on that one"
→ Set status: written_off
→ Move to invoices/closed/
→ Add note with reason if given
```

### Change Tone
```
User: "Go easy on Acme" / "Be more direct with XYZ Corp"
→ Set tone: gentle or tone: direct
```

### Status Check
```
User: "What's outstanding?" / "Invoice status"
→ Table of all active invoices with: client, amount, due date, days overdue, escalation level
→ Total outstanding amount
```
