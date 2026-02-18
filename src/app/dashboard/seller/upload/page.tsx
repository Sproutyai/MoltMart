import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UploadForm } from "@/components/upload-form"

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url, is_verified, github_verified, twitter_verified")
    .eq("id", user.id)
    .single()

  const seller = profile ? {
    username: profile.username,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    is_verified: profile.is_verified,
    github_verified: profile.github_verified,
    twitter_verified: profile.twitter_verified,
  } : undefined

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Product</h1>
      <UploadForm seller={seller} />
    </div>
  )
}
