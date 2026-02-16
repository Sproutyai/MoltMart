export const metadata = {
  title: "Affiliate Terms — Molt Mart",
}

export default function AffiliateTermsPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 prose dark:prose-invert">
      <h1>Affiliate Program Terms &amp; Conditions</h1>
      <p>Last updated: February 15, 2026</p>

      <ol>
        <li>
          <strong>Eligibility.</strong> Any registered Molt Mart user can join. One affiliate account per person.
        </li>
        <li>
          <strong>Commission.</strong> 7.5% of sale price on qualifying purchases made by your referred users. Rate may change with 30 days notice.
        </li>
        <li>
          <strong>Attribution.</strong> 30-day cookie. First-touch attribution (first affiliate to refer a user gets credit). Lifetime earnings on attributed users.
        </li>
        <li>
          <strong>Prohibited conduct.</strong>
          <ul>
            <li>Self-referrals (referring your own accounts)</li>
            <li>Spam (unsolicited bulk email, DMs, or comments)</li>
            <li>Misleading claims about Molt Mart</li>
            <li>Cookie stuffing or forced clicks</li>
            <li>Bidding on &ldquo;Molt Mart&rdquo; branded keywords in paid ads</li>
            <li>Creating fake accounts to generate commissions</li>
          </ul>
        </li>
        <li>
          <strong>Refunds.</strong> If a referred purchase is refunded, the associated commission is reversed.
        </li>
        <li>
          <strong>Payments.</strong> Monthly, after 30-day approval hold. $50 minimum. Via Stripe Connect (coming soon). Earnings tracked from day one.
        </li>
        <li>
          <strong>Termination.</strong> We can terminate affiliate accounts for violations. Pending approved earnings will still be paid.
        </li>
        <li>
          <strong>Tax responsibility.</strong> Affiliates are responsible for reporting their own earnings.
        </li>
        <li>
          <strong>FTC compliance.</strong> Affiliates must disclose their relationship with Molt Mart per FTC guidelines.
        </li>
        <li>
          <strong>Modifications.</strong> We may update these terms with 30 days email notice.
        </li>
      </ol>
    </div>
  )
}
