export const metadata = {
  title: "Seller Agreement | Molt Mart",
  description: "Seller Agreement for the Molt Mart marketplace — terms for selling AI agent enhancements.",
}

export default function SellerAgreementPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold tracking-tight text-center mb-2">Seller Agreement</h1>
      <p className="text-center text-muted-foreground mb-10">Last updated: February 19, 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Eligibility</h2>
          <p>To sell on Molt Mart, you must be at least 18 years old, have a valid account in good standing, and provide accurate payment information for receiving payouts. By listing an enhancement, you agree to this Seller Agreement.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Content Standards</h2>
          <p>Enhancements must be functional, accurately described, and not misleading. Descriptions, screenshots, and documentation should reflect the actual capabilities of the enhancement. You must provide reasonable setup instructions.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Commission &amp; Fees</h2>
          <p>Molt Mart charges a commission on each sale as displayed on the Platform at the time of listing. Commission rates may change with notice; existing listings maintain their rate until modified. Payment processing fees are deducted separately.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Payment Terms</h2>
          <p>Seller payouts are processed according to the schedule displayed on the Platform. You are responsible for providing valid payment details and for any taxes owed on your earnings. Molt Mart may withhold payouts if there are unresolved disputes or policy violations.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Intellectual Property</h2>
          <p>You retain full ownership of the enhancements you create and sell. By listing on Molt Mart, you grant us a non-exclusive license to display, distribute, and promote your enhancement on the Platform. You represent that you have the right to sell all content included in your enhancements.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Prohibited Content</h2>
          <p>You may not sell enhancements that: contain malware or malicious code; infringe on third-party intellectual property; promote illegal activity; include deceptive or fraudulent functionality; or violate our <a href="/terms" className="underline text-foreground">Terms of Service</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Takedown Process</h2>
          <p>We may remove enhancements that violate this agreement, our Terms of Service, or applicable law. Where possible, we will notify you and provide an opportunity to address the issue before removal. Repeated violations may result in account termination.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Indemnification</h2>
          <p>You agree to indemnify and hold harmless Molt Mart from any claims, damages, or expenses arising from your enhancements, your breach of this agreement, or your violation of any third-party rights.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Termination</h2>
          <p>Either party may terminate this agreement at any time. Upon termination, your enhancements will be delisted. Buyers who previously purchased your enhancements retain access. Outstanding payouts will be processed according to the standard schedule, minus any amounts owed to Molt Mart.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
          <p>Questions about the Seller Agreement? Email <a href="mailto:support@moltmart.com" className="underline text-foreground">support@moltmart.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
