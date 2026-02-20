import { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://moltmart.vercel.app"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Fetch published templates
  const { data: templates } = await supabase
    .from("templates")
    .select("slug, updated_at")
    .eq("status", "published")

  // Fetch seller profiles
  const { data: sellers } = await supabase
    .from("profiles")
    .select("username, updated_at")
    .eq("is_seller", true)

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/templates`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/templates/featured`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/affiliate`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/affiliate/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/sell`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/seller-agreement`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/dmca`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/login`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/signup`, changeFrequency: "yearly", priority: 0.2 },
  ]

  const templatePages: MetadataRoute.Sitemap = (templates ?? []).map((t) => ({
    url: `${baseUrl}/templates/${t.slug}`,
    lastModified: t.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  const sellerPages: MetadataRoute.Sitemap = (sellers ?? []).map((s) => ({
    url: `${baseUrl}/sellers/${s.username}`,
    lastModified: s.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...templatePages, ...sellerPages]
}
