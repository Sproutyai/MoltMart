export const metadata = {
  title: "DMCA Policy | Molt Mart",
  description: "DMCA and copyright policy for Molt Mart — how to submit takedown requests and counter-notices.",
}

export default function DMCAPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold tracking-tight text-center mb-2">DMCA &amp; Copyright Policy</h1>
      <p className="text-center text-muted-foreground mb-10">Last updated: February 19, 2026</p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Overview</h2>
          <p>Molt Mart respects intellectual property rights and responds to valid takedown notices under the Digital Millennium Copyright Act (DMCA). If you believe content on our Platform infringes your copyright, follow the process below.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Filing a Takedown Notice</h2>
          <p>Send a written notice to our DMCA Agent at <a href="mailto:dmca@moltmart.com" className="underline text-foreground">dmca@moltmart.com</a> including:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Identification of the copyrighted work you claim is infringed</li>
            <li>Identification of the infringing material on our Platform, with enough detail for us to locate it (e.g., URL)</li>
            <li>Your contact information (name, address, email, phone)</li>
            <li>A statement that you have a good-faith belief the use is not authorized by the copyright owner</li>
            <li>A statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf</li>
            <li>Your physical or electronic signature</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Counter-Notice</h2>
          <p>If your content was removed and you believe it was done in error, you may submit a counter-notice to <a href="mailto:dmca@moltmart.com" className="underline text-foreground">dmca@moltmart.com</a> including:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Identification of the removed material and its former location</li>
            <li>A statement under penalty of perjury that you believe the material was removed by mistake</li>
            <li>Your name, address, and phone number</li>
            <li>Consent to the jurisdiction of the federal court in your district</li>
            <li>Your physical or electronic signature</li>
          </ul>
          <p>Upon receiving a valid counter-notice, we will forward it to the original complainant. If they do not file a court action within 10–14 business days, we may restore the content.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Repeat Infringer Policy</h2>
          <p>Molt Mart will terminate accounts of users who are found to be repeat infringers. We track takedown notices and may suspend or permanently ban accounts with multiple valid claims against them.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. DMCA Agent Contact</h2>
          <p>Molt Mart DMCA Agent<br />Email: <a href="mailto:dmca@moltmart.com" className="underline text-foreground">dmca@moltmart.com</a></p>
        </section>
      </div>
    </div>
  )
}
