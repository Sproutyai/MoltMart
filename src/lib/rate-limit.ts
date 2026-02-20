import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

type RateTier = "strict" | "medium" | "default" | "export"

const limiterCache = new Map<string, Ratelimit>()

function createRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

const TIER_CONFIGS: Record<RateTier, { requests: number; window: Parameters<typeof Ratelimit.slidingWindow>[1]; prefix: string }> = {
  strict:  { requests: 5,  window: "1 m",  prefix: "rl:strict" },
  medium:  { requests: 10, window: "1 m",  prefix: "rl:medium" },
  default: { requests: 60, window: "1 m",  prefix: "rl:default" },
  export:  { requests: 2,  window: "1 h",  prefix: "rl:export" },
}

export function getRateLimiter(tier: RateTier): Ratelimit {
  if (!limiterCache.has(tier)) {
    const config = TIER_CONFIGS[tier]
    limiterCache.set(tier, new Ratelimit({
      redis: createRedis(),
      limiter: Ratelimit.slidingWindow(config.requests, config.window),
      prefix: config.prefix,
      analytics: true,
    }))
  }
  return limiterCache.get(tier)!
}

export function isUpstashConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}
