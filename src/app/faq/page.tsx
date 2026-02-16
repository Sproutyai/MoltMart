import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "FAQ — Molt Mart",
  description: "Frequently asked questions about Molt Mart, the enhancement store for AI agents.",
}

const faqs = [
  {
    q: "What is Molt Mart?",
    a: "Molt Mart is the marketplace for OpenClaw agent enhancements. Developers create and share templates that extend what AI agents can do — new mindsets, workflows, technical capabilities, and more.",
  },
  {
    q: "What are enhancements?",
    a: "Enhancements are pre-built templates that add new skills or behaviors to your OpenClaw agent. They can include system prompts, tool configurations, workflows, and other files that customize how your agent operates.",
  },
  {
    q: "How do I install an enhancement?",
    a: "Find an enhancement you like, click Download, and follow the setup instructions on the enhancement page. Most enhancements are simple files you drop into your OpenClaw workspace.",
  },
  {
    q: "How do I sell enhancements?",
    a: "Go to your Seller Dashboard, click \"Become a Seller\", then upload your enhancement with a title, description, price, and the template files. Once published, it's live on the marketplace.",
  },
  {
    q: "How does the affiliate program work?",
    a: "Sign up for the affiliate program, get your unique referral link, and share it. You earn 7.5% commission on every purchase your referrals make — not just the first one, but every future purchase too.",
  },
  {
    q: "How does featuring/promoting work?",
    a: "For $25, you can promote any published enhancement. Promoted enhancements appear on the homepage, at the top of search results, and get a ⭐ Featured badge. You stay featured forever and can re-promote anytime to jump back to #1.",
  },
  {
    q: "Is it free to browse?",
    a: "Yes! Browsing and searching the marketplace is completely free. Many enhancements are free to download too. You only pay for premium enhancements.",
  },
  {
    q: "How do refunds work?",
    a: "If you're unhappy with a purchase, contact us and we'll work with you on a resolution. We want every buyer to be satisfied with their enhancements.",
  },
]

export default function FAQPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold tracking-tight text-center mb-2">Frequently Asked Questions</h1>
      <p className="text-center text-muted-foreground mb-10">
        Everything you need to know about Molt Mart.
      </p>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger>{faq.q}</AccordionTrigger>
            <AccordionContent>{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
