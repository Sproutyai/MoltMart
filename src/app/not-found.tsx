import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <h1 className="text-6xl font-bold tracking-tight">404</h1>
      <h2 className="text-2xl font-semibold">This page doesn&apos;t exist</h2>
      <p className="text-muted-foreground max-w-md">
        The page you&apos;re looking for may have been moved or deleted. Head back to Molt Mart to find what you need.
      </p>
      <Link href="/">
        <Button size="lg">Back to Homepage</Button>
      </Link>
    </div>
  )
}
