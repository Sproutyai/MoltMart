"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TemplatePreviewProps {
  previewData: {
    soul_md?: string
    agents_md?: string
    file_list?: string[]
  } | null | undefined
}

export function TemplatePreview({ previewData }: TemplatePreviewProps) {
  if (!previewData || (!previewData.soul_md && !previewData.agents_md && (!previewData.file_list || previewData.file_list.length === 0))) {
    return (
      <div className="rounded-md border bg-muted/50 p-6 text-center text-sm text-muted-foreground">
        Preview not available for this template.
      </div>
    )
  }

  return (
    <Tabs defaultValue={previewData.soul_md ? "soul" : previewData.agents_md ? "agents" : "files"} className="w-full">
      <TabsList>
        {previewData.soul_md && <TabsTrigger value="soul">SOUL.md</TabsTrigger>}
        {previewData.agents_md && <TabsTrigger value="agents">AGENTS.md</TabsTrigger>}
        {previewData.file_list && previewData.file_list.length > 0 && <TabsTrigger value="files">Files</TabsTrigger>}
      </TabsList>
      {previewData.soul_md && (
        <TabsContent value="soul" className="rounded-md border bg-muted/50 p-4">
          <pre className="whitespace-pre-wrap text-sm font-mono">{previewData.soul_md}</pre>
        </TabsContent>
      )}
      {previewData.agents_md && (
        <TabsContent value="agents" className="rounded-md border bg-muted/50 p-4">
          <pre className="whitespace-pre-wrap text-sm font-mono">{previewData.agents_md}</pre>
        </TabsContent>
      )}
      {previewData.file_list && previewData.file_list.length > 0 && (
        <TabsContent value="files" className="rounded-md border bg-muted/50 p-4">
          <ul className="space-y-1 text-sm font-mono">
            {previewData.file_list.map((f) => (
              <li key={f}>📄 {f}</li>
            ))}
          </ul>
        </TabsContent>
      )}
    </Tabs>
  )
}
