/**
 * Maps each template category to a default placeholder image path.
 * Used when a template has no screenshots uploaded.
 */

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  Personas: "/defaults/personas.svg",
  Skills: "/defaults/skills.svg",
  Workflows: "/defaults/workflows.svg",
  "Heartbeats & Monitoring": "/defaults/heartbeats-monitoring.svg",
  "Cron & Scheduling": "/defaults/cron-scheduling.svg",
  "Browser Automations": "/defaults/browser-automations.svg",
  "Channels & Integrations": "/defaults/channels-integrations.svg",
  "Node & Device Control": "/defaults/node-device-control.svg",
  "Memory & Context": "/defaults/memory-context.svg",
  "Multi-Agent & Orchestration": "/defaults/multi-agent-orchestration.svg",
}

const FALLBACK_IMAGE = "/defaults/skills.svg"

/**
 * Returns the default placeholder image URL for a given category.
 */
export function getCategoryDefaultImage(category: string): string {
  return CATEGORY_DEFAULT_IMAGES[category] ?? FALLBACK_IMAGE
}

/**
 * Returns the first screenshot URL, or the category default if none exist.
 */
export function getTemplateImage(
  screenshots: string[] | null | undefined,
  category: string
): string {
  if (screenshots && screenshots.length > 0 && screenshots[0]) {
    return screenshots[0]
  }
  return getCategoryDefaultImage(category)
}
