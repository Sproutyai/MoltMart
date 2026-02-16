import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditTemplateForm } from "@/components/edit-template-form"

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .single()

  if (!template) notFound()
  if (template.seller_id !== user.id) redirect("/dashboard/seller")

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Enhancement</h1>
      <EditTemplateForm template={template} />
    </div>
  )
}
