import {
  Brain,
  Zap,
  Code,
  Activity,
  Clock,
  Globe,
  MessageSquare,
  Monitor,
  Database,
  Users,
} from "lucide-react"

export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Personas: Brain,
  Skills: Zap,
  Workflows: Code,
  "Heartbeats & Monitoring": Activity,
  "Cron & Scheduling": Clock,
  "Browser Automations": Globe,
  "Channels & Integrations": MessageSquare,
  "Node & Device Control": Monitor,
  "Memory & Context": Database,
  "Multi-Agent & Orchestration": Users,
}

export const CATEGORY_GRADIENTS: Record<string, string> = {
  Personas: "from-purple-500/20 to-violet-500/10",
  Skills: "from-amber-500/20 to-yellow-500/10",
  Workflows: "from-blue-500/20 to-cyan-500/10",
  "Heartbeats & Monitoring": "from-rose-500/20 to-pink-500/10",
  "Cron & Scheduling": "from-slate-500/20 to-gray-500/10",
  "Browser Automations": "from-emerald-500/20 to-green-500/10",
  "Channels & Integrations": "from-indigo-500/20 to-blue-500/10",
  "Node & Device Control": "from-teal-500/20 to-cyan-500/10",
  "Memory & Context": "from-orange-500/20 to-amber-500/10",
  "Multi-Agent & Orchestration": "from-fuchsia-500/20 to-purple-500/10",
}
