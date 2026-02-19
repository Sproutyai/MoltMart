-- Seed 6 new Molt Mart Official listings
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

INSERT INTO templates (title, slug, description, category, price_cents, seller_id, screenshots, status) VALUES
('Morning Briefing Autopilot', 'morning-briefing-autopilot',
 'A complete daily morning briefing system. Every morning at your chosen time, an isolated cron job wakes your agent to compile weather, calendar events, and top news — then delivers a concise briefing to your WhatsApp/Discord/Slack.',
 'Cron & Scheduling', 300, '2f04a9fa-b87f-4480-9042-5efed98a0c61',
 '["https://molt-mart.vercel.app/listings/morning-briefing.webp"]', 'published'),

('Memory Janitor', 'memory-janitor',
 'An AGENTS.md configuration + weekly cron job that keeps your memory files clean and useful. Prevents memory files from growing unbounded with rules for what to remember, what to forget, and weekly compaction.',
 'Memory & Context', 200, '2f04a9fa-b87f-4480-9042-5efed98a0c61',
 '["https://molt-mart.vercel.app/listings/memory-janitor.webp"]', 'published'),

('Security Sentinel', 'security-sentinel',
 'A complete security monitoring setup: HEARTBEAT.md that checks for suspicious activity, plus a daily deep security audit cron job. Uses built-in health checks and port monitoring to keep your system secure automatically.',
 'Heartbeats & Monitoring', 500, '2f04a9fa-b87f-4480-9042-5efed98a0c61',
 '["https://molt-mart.vercel.app/listings/security-sentinel.webp"]', 'published'),

('Multi-Agent Research Team', 'multi-agent-research-team',
 'A SOUL.md + AGENTS.md configuration that turns your OpenClaw into a research orchestrator. Automatically spawns 2-3 sub-agents to research different angles in parallel, then synthesizes findings. Includes cost-saving config for sub-agents.',
 'Multi-Agent & Orchestration', 700, '2f04a9fa-b87f-4480-9042-5efed98a0c61',
 '["https://molt-mart.vercel.app/listings/multi-agent.webp"]', 'published'),

('Senior Dev Persona', 'senior-dev-persona',
 'A battle-tested SOUL.md that transforms your agent into a senior developer who writes clean, maintainable code. Includes coding standards, PR review guidelines, and architecture decision frameworks.',
 'Personas', 700, '2f04a9fa-b87f-4480-9042-5efed98a0c61',
 '["https://molt-mart.vercel.app/listings/senior-dev.webp"]', 'published'),

('Daily Deal Hunter', 'daily-deal-hunter',
 'A browser automation setup that scans deal sites daily for products matching your criteria. Monitors prices, sends alerts when deals drop below your threshold, and tracks price history over time.',
 'Browser Automations', 900, '2f04a9fa-b87f-4480-9042-5efed98a0c61',
 '["https://molt-mart.vercel.app/listings/deal-hunter.webp"]', 'published');
