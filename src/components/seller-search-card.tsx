import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface SellerSearchCardProps {
  seller: {
    username: string
    display_name: string | null
    avatar_url: string | null
    bio: string | null
  }
}

export function SellerSearchCard({ seller }: SellerSearchCardProps) {
  return (
    <Link href={`/sellers/${seller.username}`}>
      <Card className="min-w-[200px] transition-all hover:shadow-md hover:scale-[1.02]">
        <CardContent className="flex items-center gap-3 p-3">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-muted">
            {seller.avatar_url ? (
              <img src={seller.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">
                {(seller.display_name || seller.username)?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{seller.display_name || seller.username}</p>
            <p className="text-xs text-muted-foreground">@{seller.username}</p>
            {seller.bio && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{seller.bio}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
