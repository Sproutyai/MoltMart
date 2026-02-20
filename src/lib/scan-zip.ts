import JSZip from "jszip"
import crypto from "crypto"

export interface ScanResult {
  status: "clean" | "flagged" | "rejected"
  findings: string[]
  fileCount: number
  fileHash: string
}

const SUSPICIOUS_PATTERNS = [
  { pattern: /rm\s+-rf/gi, label: "Destructive shell command (rm -rf)" },
  { pattern: /curl\s.*\|\s*(?:ba)?sh/gi, label: "Remote code execution (curl|bash)" },
  { pattern: /wget\s.*\|\s*(?:ba)?sh/gi, label: "Remote code execution (wget|bash)" },
  { pattern: /eval\s*\(/gi, label: "eval() usage" },
  { pattern: /exec\s*\(/gi, label: "exec() usage" },
  { pattern: /child_process/gi, label: "child_process module reference" },
  { pattern: /process\.env\.(API_KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL)/gi, label: "Credential harvesting pattern" },
  { pattern: /\\x[0-9a-f]{2}(\\x[0-9a-f]{2}){5,}/gi, label: "Obfuscated code (hex sequences)" },
  { pattern: /atob\s*\(|btoa\s*\(/gi, label: "Base64 encode/decode (potential obfuscation)" },
  { pattern: /String\.fromCharCode\s*\(\s*\d+(\s*,\s*\d+){10,}/gi, label: "Obfuscated string construction" },
  { pattern: /fetch\s*\(\s*['"`]https?:\/\//gi, label: "External URL fetch" },
  { pattern: /XMLHttpRequest/gi, label: "XMLHttpRequest usage" },
  { pattern: /\.exe\b|\.bat\b|\.cmd\b|\.sh\b|\.ps1\b/gi, label: "Executable file reference" },
]

const BINARY_EXTENSIONS = new Set([
  ".exe", ".dll", ".so", ".dylib", ".bin", ".com", ".bat", ".cmd",
  ".ps1", ".sh", ".msi", ".dmg", ".app", ".deb", ".rpm",
])

export async function scanZipContents(buffer: Buffer): Promise<ScanResult> {
  const fileHash = crypto.createHash("sha256").update(buffer).digest("hex")
  const findings: string[] = []

  try {
    const zip = await JSZip.loadAsync(buffer)
    const files = Object.keys(zip.files).filter((f) => !zip.files[f].dir)

    // Check for binary files
    for (const name of files) {
      const ext = "." + name.split(".").pop()?.toLowerCase()
      if (BINARY_EXTENSIONS.has(ext)) {
        findings.push(`Unexpected binary file: ${name}`)
      }
    }

    // Scan text file contents
    for (const name of files) {
      const ext = name.split(".").pop()?.toLowerCase() || ""
      // Only scan text-like files
      if (["md", "txt", "json", "yaml", "yml", "toml", "js", "ts", "py", "sh", "bat", "cfg", "conf", "ini", "xml", "html", "css"].includes(ext)) {
        try {
          const content = await zip.files[name].async("string")
          for (const { pattern, label } of SUSPICIOUS_PATTERNS) {
            pattern.lastIndex = 0
            if (pattern.test(content)) {
              findings.push(`${label} in ${name}`)
            }
          }
        } catch {
          // Binary file with text extension - suspicious
          findings.push(`Unreadable file with text extension: ${name}`)
        }
      }
    }

    const status = findings.length === 0 ? "clean" : findings.length >= 3 ? "rejected" : "flagged"

    return { status, findings, fileCount: files.length, fileHash }
  } catch {
    return { status: "rejected", findings: ["Invalid or corrupt zip file"], fileCount: 0, fileHash }
  }
}
