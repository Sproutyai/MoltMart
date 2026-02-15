"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TemplatePreviewProps {
  previewData: {
    soul_md?: string
    agents_md?: string
    file_list?: string[]
  }
}

export function TemplatePreview({ previewData }: TemplatePreviewProps) {
  return (
    <Tabs defaultValue="soul" className="w-full">
      <TabsList>
        <TabsTrigger value="soul">SOUL.md</TabsTrigger>
        <TabsTrigger value="agents">AGENTS.md</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
      </TabsList>
      <TabsContent value="soul" className="rounded-md border bg-muted/50 p-4">
        <pre className="whitespace-pre-wrap text-sm">
          {previewData.soul_md || "No SOUL.md preview available"}
        </pre>
      </TabsContent>
      <TabsContent value="agents" className="rounded-md border bg-muted/50 p-4">
        <pre className="whitespace-pre-wrap text-sm">
          {previewData.agents_md || "No AGENTS.md preview available"}
        </pre>
      </TabsContent>
      <TabsContent value="files" className="rounded-md border bg-muted/50 p-4">
        {previewData.file_list?.length ? (
          <ul className="space-y-1 text-sm font-mono">
            {previewData.file_list.map((f) => (
              <li key={f}>📄 {f}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No file list available</p>
        )}
      </TabsContent>
    </Tabs>
  )
}
