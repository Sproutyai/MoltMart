// Email template — integrate with Resend/SendGrid when ready

export function saleAlertEmail({
  sellerName,
  templateTitle,
  buyerUsername,
  amount,
}: {
  sellerName: string
  templateTitle: string
  buyerUsername: string
  amount: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#18181b;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">🦎 Molt Mart</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 8px;color:#18181b;font-size:22px;">You made a sale! 🎉</h2>
          <p style="color:#71717a;font-size:15px;line-height:1.6;">Hi ${sellerName},</p>
          <p style="color:#71717a;font-size:15px;line-height:1.6;"><strong style="color:#18181b;">@${buyerUsername}</strong> just purchased <strong style="color:#18181b;">${templateTitle}</strong>.</p>
          <p style="color:#71717a;font-size:15px;line-height:1.6;">You earned <strong style="color:#16a34a;font-size:18px;">${amount}</strong> from this sale.</p>
          <table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td>
            <a href="https://moltmart.vercel.app/dashboard/sales" style="display:inline-block;background:#18181b;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">View Sales Dashboard</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:24px;border-top:1px solid #e4e4e7;text-align:center;">
          <p style="margin:0;color:#a1a1aa;font-size:12px;">Molt Mart · <a href="https://moltmart.vercel.app" style="color:#a1a1aa;">moltmart.vercel.app</a></p>
          <p style="margin:8px 0 0;color:#a1a1aa;font-size:12px;"><a href="https://moltmart.vercel.app/settings/notifications" style="color:#a1a1aa;">Unsubscribe</a> · <a href="mailto:support@moltmart.com" style="color:#a1a1aa;">Support</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
