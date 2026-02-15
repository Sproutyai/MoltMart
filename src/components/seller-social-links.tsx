import { Globe, Github, Twitter } from "lucide-react"

interface SellerSocialLinksProps {
  website: string | null | undefined
  github_username: string | null | undefined
  twitter_username: string | null | undefined
}

export function SellerSocialLinks({ website, github_username, twitter_username }: SellerSocialLinksProps) {
  const links = [
    website && { href: website.startsWith("http") ? website : `https://${website}`, icon: Globe, label: "Website" },
    github_username && { href: `https://github.com/${github_username}`, icon: Github, label: "GitHub" },
    twitter_username && { href: `https://x.com/${twitter_username}`, icon: Twitter, label: "X / Twitter" },
  ].filter(Boolean) as { href: string; icon: React.ComponentType<{ size?: number }>; label: string }[]

  if (links.length === 0) return null

  return (
    <div className="flex items-center gap-3">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          title={link.label}
        >
          <link.icon size={18} />
        </a>
      ))}
    </div>
  )
}
