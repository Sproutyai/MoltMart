export const CATEGORIES = [
  'Personas',
  'Skills',
  'Workflows',
  'Heartbeats & Monitoring',
  'Cron & Scheduling',
  'Browser Automations',
  'Channels & Integrations',
  'Node & Device Control',
  'Memory & Context',
  'Multi-Agent & Orchestration',
] as const

export type Category = (typeof CATEGORIES)[number]

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export const AI_MODELS = ['Claude', 'GPT-4', 'GPT-4o', 'Gemini', 'Llama', 'Mistral', 'Other'] as const

export const LICENSES = ['MIT', 'Apache-2.0', 'GPL-3.0', 'Commercial', 'Custom'] as const

export const PREMADE_AVATARS = [
  { id: "robot", url: "/avatars/avatar-robot.webp", label: "Robot" },
  { id: "cart", url: "/avatars/avatar-cart.webp", label: "Shopping Cart" },
  { id: "banana", url: "/avatars/avatar-banana.webp", label: "Banana" },
  { id: "cat", url: "/avatars/avatar-cat.webp", label: "Cat" },
  { id: "cactus", url: "/avatars/avatar-cactus.webp", label: "Cactus" },
] as const

export type PremadeAvatarId = (typeof PREMADE_AVATARS)[number]["id"]

export const SITE_NAME = 'Molt Mart'
export const SITE_DESCRIPTION = 'The enhancement store for OpenClaw AI agents'
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_SCREENSHOTS = 5
export const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024 // 5MB per screenshot
