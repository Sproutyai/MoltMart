export const metadata = {
  title: "Privacy Policy | Molt Mart",
  description: "Privacy Policy for Molt Mart — how we collect, use, and protect your data.",
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold tracking-tight text-center mb-2">Privacy Policy</h1>
      <p className="text-center text-muted-foreground mb-10">Last updated: February 19, 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
          <p><strong className="text-foreground">Account data:</strong> When you sign up, we collect your email address and profile information through Supabase Auth. If you sign in with a third-party provider (e.g., Google, GitHub), we receive your name and email from that provider.</p>
          <p><strong className="text-foreground">Payment data:</strong> Payments are processed by Stripe. We do not store your credit card details. Stripe may collect billing information in accordance with their privacy policy.</p>
          <p><strong className="text-foreground">Usage data:</strong> We collect basic analytics such as pages visited, browser type, and device information to improve the Platform.</p>
          <p><strong className="text-foreground">User content:</strong> Enhancements, descriptions, reviews, and other content you upload to the Platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Cookies</h2>
          <p>We use essential cookies for authentication and session management. We may use analytics cookies to understand usage patterns. You can disable non-essential cookies in your browser settings.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
          <p>We use your information to: operate and improve the Platform; process transactions; communicate with you about your account; enforce our terms; and detect fraud or abuse.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Third-Party Services</h2>
          <p>We use the following third-party services that may process your data: Supabase (authentication and database), Stripe (payments), and analytics providers. Each operates under their own privacy policies.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Data Retention</h2>
          <p>We retain your account data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law or for legitimate business purposes (e.g., transaction records).</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Your Rights (GDPR/CCPA)</h2>
          <p>Depending on your location, you may have the right to: access, correct, or delete your personal data; object to processing; request data portability; and opt out of the sale of personal information. We do not sell your personal information. To exercise any of these rights, contact us at <a href="mailto:support@moltmart.com" className="underline text-foreground">support@moltmart.com</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest. However, no system is 100% secure and we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Children&apos;s Privacy</h2>
          <p>Molt Mart is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has created an account, contact us and we will remove it.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">9. Changes</h2>
          <p>We may update this policy from time to time. We will notify you of material changes via email or a notice on the Platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">10. Contact</h2>
          <p>For privacy-related questions, email <a href="mailto:support@moltmart.com" className="underline text-foreground">support@moltmart.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
