import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sell Your AI Agent Templates | Molt Mart",
  description: "Join Molt Mart as a seller. Upload your AI agent templates, set your own prices, and reach thousands of buyers.",
}
import { Button } from "@/components/ui/button"
import { Upload, DollarSign, Users, Megaphone } from "lucide-react"

export default function SellPage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Sell Your AI Enhancements on Molt Mart
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Join a growing marketplace of AI creators. Share your prompts, templates, and tools with thousands of buyers.
        </p>
        <Button size="lg" asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
      </section>

      {/* Benefits */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Users, title: "Reach Buyers", desc: "Get your enhancements in front of an active community of AI enthusiasts." },
          { icon: DollarSign, title: "Set Your Own Price", desc: "You decide how much to charge — or offer items for free to build your audience." },
          { icon: Upload, title: "Easy Upload Process", desc: "Upload a .zip, add a description and screenshots, and you're live in minutes." },
          { icon: Megaphone, title: "Promote Your Listings", desc: "Feature your enhancements, earn badges, and grow your seller reputation." },
        ].map((b) => (
          <div key={b.title} className="rounded-lg border p-6 space-y-2">
            <b.icon className="h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold">{b.title}</h3>
            <p className="text-sm text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="space-y-6">
        <h2 className="text-center text-2xl font-bold">How It Works</h2>
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-4">
          {[
            { step: "1", title: "Sign Up", desc: "Create your free Molt Mart account." },
            { step: "2", title: "Upload", desc: "Upload your enhancement as a .zip file." },
            { step: "3", title: "Set Pricing", desc: "Choose free or set a price." },
            { step: "4", title: "Start Earning", desc: "Buyers discover and download your work." },
          ].map((s) => (
            <div key={s.step} className="text-center space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                {s.step}
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Ready to start selling?</h2>
        <Button size="lg" asChild>
          <Link href="/signup">Get Started</Link>
        </Button>
      </section>
    </div>
  )
}
