export function generateReferralCode(username: string): string {
  const hex = Math.random().toString(16).slice(2, 6)
  return `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${hex}`
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function getReferralUrl(code: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://molt-mart.vercel.app'
  return `${base}/?ref=${code}`
}

export function getTwitterShareUrl(code: string): string {
  const url = getReferralUrl(code)
  const text = `Check out Molt Mart — a marketplace for AI agent templates. ${url}`
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
}

export function getLinkedInShareUrl(code: string): string {
  const url = getReferralUrl(code)
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
}
