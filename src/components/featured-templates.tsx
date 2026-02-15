import { TemplateCard } from "@/components/template-card"
import type { Template } from "@/lib/types"

interface FeaturedTemplatesProps {
  templates: Template[]
}

export function FeaturedTemplates({ templates }: FeaturedTemplatesProps) {
  if (!templates || templates.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">📌 Featured</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {templates.map((t) => (
          <div key={t.id} className="min-w-[280px] max-w-[320px] flex-shrink-0">
            <TemplateCard template={t} />
          </div>
        ))}
      </div>
    </div>
  )
}
