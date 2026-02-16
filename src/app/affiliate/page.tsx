import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Link2, Share2, DollarSign } from "lucide-react"

export const metadata = {
  title: "Affiliate Program — Molt Mart",
  description: "Earn 7.5% commission on every sale by referring developers to Molt Mart.",
}

export default async function AffiliatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ctaHref = user ? "/dashboard/affiliate" : "/signup"
  const ctaText = user ? "Get Your Referral Link" : "Sign Up to Start"
  const ctaText2 = user ? "Go to Affiliate Dashboard" : "Sign Up to Start"

  return (
    <div>
      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center py-20 px-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Refer developers to Molt Mart.<br />Earn 7.5% on every sale.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          You earn commission on every purchase your referrals make — not just the first one. Free to join.
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link href={ctaHref}>{ctaText}</Link>
        </Button>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto py-16 px-4">
        <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Link2, title: "1. Get your link", desc: "Sign up and copy your unique referral URL." },
            { icon: Share2, title: "2. Share it", desc: "Post it wherever developers hang out." },
            { icon: DollarSign, title: "3. Earn commission", desc: "7.5% on every sale your referrals make, for as long as they're a customer." },
          ].map((step) => (
            <div key={step.title} className="text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-4xl mx-auto py-16 px-4">
        <h2 className="text-2xl font-bold text-center mb-10">Why it&apos;s worth it</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { title: "Lifetime earnings", desc: "Your referrals buy a template 6 months from now? You still earn." },
            { title: "Real-time tracking", desc: "See clicks and conversions as they happen in your dashboard." },
            { title: "No minimums", desc: "No traffic requirements, no approval process. Anyone can join." },
            { title: "Honest tracking", desc: "30-day cookie, transparent dashboard, no hidden rules." },
          ].map((b) => (
            <Card key={b.title} className="p-6">
              <h3 className="font-semibold mb-1">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto py-16 px-4">
        <h2 className="text-2xl font-bold text-center mb-10">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {[
            { q: "How much can I earn?", a: "7.5% of every sale. A $25 template earns you $1.88. Refer 20 active buyers and it compounds into real passive income." },
            { q: "When do I get paid?", a: "We're launching payments soon via Stripe Connect. All earnings are tracked from day one and will be paid retroactively." },
            { q: "Do I earn on repeat purchases?", a: "Yes. Every purchase a referred user makes, forever." },
            { q: "Can I be a seller AND an affiliate?", a: "Yes. You cannot earn affiliate commission on your own products." },
            { q: "What are the rules?", a: "Don't spam. Don't self-refer. Disclose your affiliation. Full terms at /affiliate/terms." },
          ].map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-xl mx-auto text-center py-16 px-4">
        <h2 className="text-2xl font-bold">Ready? It takes 10 seconds.</h2>
        <p className="mt-2 text-muted-foreground">Join the affiliate program and start earning today.</p>
        <Button size="lg" className="mt-6" asChild>
          <Link href={ctaHref}>{ctaText2}</Link>
        </Button>
      </section>
    </div>
  )
}
