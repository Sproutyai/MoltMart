import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Log In | Molt Mart",
  description: "Log in to your Molt Mart account to browse, buy, and sell AI agent templates.",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
