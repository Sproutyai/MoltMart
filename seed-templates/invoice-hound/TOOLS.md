# TOOLS.md — Invoice Hound

## Messaging

Invoice Hound drafts follow-up messages for your approval. To actually send them, you need a messaging channel configured in OpenClaw.

### Supported Channels
- **WhatsApp** — Send follow-ups via WhatsApp (requires OpenClaw WhatsApp integration)
- **Email** — If email tool is available
- **Manual** — Copy-paste the drafted message yourself (always works, no setup needed)

### How It Works
1. Invoice Hound drafts a message based on the escalation level
2. You review and approve (or edit) the draft
3. If a messaging channel is configured, you can say "send it" and Invoice Hound sends via that channel
4. If no channel is configured, you copy-paste the message to your client

### Configuration

Add your client's preferred contact method in the invoice file:

```yaml
contact: "+1234567890"          # WhatsApp
contact: "client@email.com"     # Email
contact: "manual"               # You'll copy-paste
```

## File System

Invoice Hound reads and writes files in the `invoices/` directory. No external APIs required for core tracking functionality.

## Cron / Heartbeat

For automatic daily checks, configure a heartbeat or cron in OpenClaw that triggers Invoice Hound to scan for overdue invoices. Without this, checks happen whenever you start a session.
