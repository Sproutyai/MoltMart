import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import JSZip from "jszip"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch template with seller info
  const { data: template } = await supabase
    .from("templates")
    .select("id, title, slug, description, category, version, file_path, preview_data, seller:profiles!seller_id(username)")
    .eq("id", id)
    .eq("status", "published")
    .single()

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  }

  // Upsert purchase record (try authenticated client first, fall back to admin)
  const { error: purchaseError } = await supabase.from("purchases").upsert(
    {
      buyer_id: user.id,
      template_id: id,
      price_cents: 0,
    },
    { onConflict: "buyer_id,template_id" }
  )

  if (purchaseError) {
    console.error("Purchase upsert failed (RLS client):", purchaseError.message, purchaseError.code)
    // Retry with admin client to bypass RLS
    const admin = createAdminClient()
    const { error: adminError } = await admin.from("purchases").upsert(
      {
        buyer_id: user.id,
        template_id: id,
        price_cents: 0,
      },
      { onConflict: "buyer_id,template_id" }
    )
    if (adminError) {
      console.error("Purchase upsert failed (admin client):", adminError.message, adminError.code)
    } else {
      console.log("Purchase recorded via admin client for user:", user.id, "template:", id)
    }
  }

  // Increment download count
  await supabase.rpc("increment_download_count", { tid: id })

  // Download the original zip from storage
  const { data: fileData, error: storageError } = await supabase.storage
    .from("templates")
    .download(template.file_path)

  const seller = template.seller as unknown as { username: string }
  const previewData = template.preview_data as Record<string, unknown> | null
  const fileList = (previewData as { file_list?: string[] })?.file_list || []
  const templateName = template.title
  const templateSlug = template.slug
  const sourceUrl = `https://molt-mart.vercel.app/templates/${templateSlug}`

  const newZip = new JSZip()

  if (!storageError && fileData) {
    // Build from storage zip
    const originalZip = await JSZip.loadAsync(await fileData.arrayBuffer())
    for (const [path, zipEntry] of Object.entries(originalZip.files)) {
      if (!zipEntry.dir) {
        const content = await zipEntry.async("uint8array")
        newZip.file(path, content)
      }
    }
  } else if (previewData) {
    // Fallback: build zip from preview_data (file contents stored as key-value pairs)
    for (const [filename, content] of Object.entries(previewData)) {
      if (filename === "file_list") continue
      if (typeof content === "string") {
        newZip.file(filename, content)
      }
    }
  } else {
    return NextResponse.json({ error: "Could not download template file" }, { status: 500 })
  }

  // Add molt-mart.json manifest
  const manifest = {
    name: templateName,
    slug: templateSlug,
    version: template.version || "1.0.0",
    author: seller.username,
    description: template.description,
    category: template.category,
    source: sourceUrl,
    installed_at: null,
    files: fileList,
  }
  newZip.file("molt-mart.json", JSON.stringify(manifest, null, 2))

  // Add README.md
  const readme = `# ${templateName}

> Downloaded from [Molt Mart](${sourceUrl})

## Installation

### Method 1: Run the installer
\`\`\`bash
cd ~/Downloads
unzip ${templateSlug}.zip
cd ${templateSlug}
bash install.sh
\`\`\`

### Method 2: Manual copy
Copy the template files to your OpenClaw workspace:
\`\`\`bash
cp -r SOUL.md AGENTS.md TOOLS.md ~/.openclaw/workspace/
\`\`\`

### Method 3: Tell your AI agent
Just say:
> "Install the ${templateName} template I just downloaded"

Your agent will find the zip in your Downloads folder and handle the rest.

## What's Included
${fileList.map((f) => `- ${f}`).join("\n")}

## About
- **Author:** ${seller.username}
- **Category:** ${template.category}
- **Version:** ${template.version || "1.0.0"}
- **Source:** ${sourceUrl}
`
  newZip.file("README.md", readme)

  // Add install.sh
  const installScript = `#!/bin/bash
# Molt Mart Enhancement Installer
# ${templateName}

TARGET="\${OPENCLAW_WORKSPACE:-\$HOME/.openclaw/workspace}"
BACKUP_DIR="\$TARGET/.molt-mart-backup/\$(date +%Y%m%d-%H%M%S)"

echo "🦎 Installing ${templateName} to \$TARGET..."
echo ""

# Create backup
if [ -f "\$TARGET/SOUL.md" ] || [ -f "\$TARGET/AGENTS.md" ] || [ -f "\$TARGET/TOOLS.md" ]; then
  echo "📦 Backing up existing files to \$BACKUP_DIR..."
  mkdir -p "\$BACKUP_DIR"
  for f in SOUL.md AGENTS.md TOOLS.md MEMORY.md; do
    if [ -f "\$TARGET/\$f" ]; then
      cp "\$TARGET/\$f" "\$BACKUP_DIR/\$f"
      echo "   Backed up \$f"
    fi
  done
  echo ""
fi

# Copy template files
SCRIPT_DIR="\$(cd "\$(dirname "\$0")" && pwd)"
${fileList.map((f) => `if [ -f "\$SCRIPT_DIR/${f}" ]; then
  mkdir -p "\$TARGET/\$(dirname "${f}")"
  cp "\$SCRIPT_DIR/${f}" "\$TARGET/${f}"
  echo "   ✅ Installed ${f}"
fi`).join("\n")}

echo ""
echo "✅ ${templateName} installed successfully!"
echo "   Restart your OpenClaw agent to apply changes."
${fileList.length === 0 ? '# No files detected in manifest' : ''}
`
  newZip.file("install.sh", installScript)

  // Generate the zip
  const zipBuffer = await newZip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  })

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${templateSlug}.zip"`,
    },
  })
}
