export const CATEGORIES = [
  'Productivity',
  'Coding',
  'Writing',
  'Research',
  'Communication',
  'Automation',
  'Security',
  'Personality',
] as const

export type Category = (typeof CATEGORIES)[number]

export const SITE_NAME = 'Molt Mart'
export const SITE_DESCRIPTION = 'The marketplace for OpenClaw AI agent templates'
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10MB
