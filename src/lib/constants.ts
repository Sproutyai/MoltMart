export const CATEGORIES = [
  'Basic Skills',
  'Mindset',
  'Workflows',
  'Technical',
  'Creative',
  'Knowledge',
] as const

export type Category = (typeof CATEGORIES)[number]

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export const AI_MODELS = ['Claude', 'GPT-4', 'GPT-4o', 'Gemini', 'Llama', 'Mistral', 'Other'] as const

export const LICENSES = ['MIT', 'Apache-2.0', 'GPL-3.0', 'Commercial', 'Custom'] as const

export const SITE_NAME = 'Molt Mart'
export const SITE_DESCRIPTION = 'The enhancement store for OpenClaw AI agents'
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_SCREENSHOTS = 5
export const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024 // 5MB per screenshot
