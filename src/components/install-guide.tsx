"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Terminal, FolderOpen, Bot } from "lucide-react"

interface InstallGuideProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateName: string
  templateSlug: string
}

export function InstallGuide({ open, onOpenChange, templateName, templateSlug }: InstallGuideProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Install {templateName}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="script" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="script" className="text-xs sm:text-sm">
              <Terminal className="mr-1.5 h-3.5 w-3.5" />
              Script
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-xs sm:text-sm">
              <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="agent" className="text-xs sm:text-sm">
              <Bot className="mr-1.5 h-3.5 w-3.5" />
              AI Agent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="script" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">
              Run the included installer script — it backs up your existing files automatically.
            </p>
            <div className="rounded-md bg-muted p-3">
              <code className="text-xs block whitespace-pre-wrap">{`cd ~/Downloads\nunzip ${templateSlug}.zip\ncd ${templateSlug}\nbash install.sh`}</code>
            </div>
            <p className="text-xs text-muted-foreground">
              ⚠️ Your current files are backed up to <code>~/.openclaw/workspace/.molt-mart-backup/</code>
            </p>
          </TabsContent>

          <TabsContent value="manual" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">
              Extract the zip and copy the template files to your workspace.
            </p>
            <div className="rounded-md bg-muted p-3">
              <code className="text-xs block whitespace-pre-wrap">{`# Extract the zip\nunzip ${templateSlug}.zip -d ${templateSlug}\n\n# Copy files to your workspace\ncp ${templateSlug}/SOUL.md ~/.openclaw/workspace/\ncp ${templateSlug}/AGENTS.md ~/.openclaw/workspace/`}</code>
            </div>
            <p className="text-xs text-muted-foreground">
              Check <code>molt-mart.json</code> in the zip for the full list of included files.
            </p>
          </TabsContent>

          <TabsContent value="agent" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground">
              Just tell your OpenClaw agent to install it. Copy and paste this:
            </p>
            <div className="rounded-md bg-muted p-3">
              <code className="text-sm block">
                &quot;Install the {templateName} template I just downloaded&quot;
              </code>
            </div>
            <p className="text-xs text-muted-foreground">
              Your agent will find the zip in your Downloads folder, read the manifest, and handle the installation with your approval.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
