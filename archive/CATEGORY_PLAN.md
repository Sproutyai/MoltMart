# Molt Mart — Category Consolidation Plan

> 14 categories → 5. Broad, intuitive, on-brand for an AI enhancement marketplace.

---

## The 5 Categories

### 1. 🧠 Mindset — `Brain` icon
**Lucide icon:** `brain`

**What it covers:** Personality, tone, communication style, values, behavioral frameworks — everything that shapes *who* the agent is and *how* it interacts.

**Old categories mapped:** Personality, Communication

**Why it works:** This is the most uniquely "AI agent" category. No other marketplace has it. It's the soul of SOUL.md.

---

### 2. ⚡ Workflows — `Zap` icon
**Lucide icon:** `zap`

**What it covers:** Productivity systems, automation routines, task management, scheduling, email handling, research pipelines — anything that helps an agent *get things done* more effectively.

**Old categories mapped:** Productivity, Automation, Research, Finance

**Why it works:** Broad enough for any "do X better/faster" template. Finance templates are really just financial workflows. Research is a workflow. This is the biggest bucket and that's fine.

---

### 3. 🛠️ Technical — `Code` icon
**Lucide icon:** `code`

**What it covers:** Coding skills, DevOps, security practices, data science, system administration — anything requiring technical/engineering knowledge.

**Old categories mapped:** Coding, DevOps, Security, Data Science

**Why it works:** These are all "engineer brain" enhancements. A developer browsing Molt Mart will look here. Clean and obvious.

---

### 4. ✍️ Creative — `Palette` icon
**Lucide icon:** `palette`

**What it covers:** Writing, content creation, storytelling, copywriting, design thinking, entertainment, gaming — the creative and expressive side.

**Old categories mapped:** Writing, Entertainment, Education (content-creation side)

**Why it works:** Writing is the #1 use case for AI agents. Bundling it with all creative output makes this a strong, browsable category.

---

### 5. 📚 Knowledge — `Library` icon
**Lucide icon:** `library`

**What it covers:** Domain expertise, learning frameworks, educational content, specialized knowledge bases, industry-specific skills — anything that makes the agent *smarter* in a specific domain.

**Old categories mapped:** Education, Other (domain-specific stuff), plus overflow from any category where the template is really about "knowing things" rather than "doing things"

**Why it works:** "Other" is a junk drawer. This replaces it with something meaningful. Any niche template (legal, medical, real estate, etc.) has a home here.

---

## Migration Map (quick reference)

| Old Category | → New Category |
|---|---|
| Productivity | Workflows |
| Coding | Technical |
| Writing | Creative |
| Research | Workflows |
| Communication | Mindset |
| Automation | Workflows |
| Security | Technical |
| Personality | Mindset |
| Education | Knowledge |
| Finance | Workflows |
| Data Science | Technical |
| DevOps | Technical |
| Entertainment | Creative |
| Other | Knowledge (default) |

---

## Implementation Notes

- **No "Other" category.** Everything has a home. If sellers can't pick one, default to Knowledge.
- **Category order on the site:** Mindset → Workflows → Technical → Creative → Knowledge (leads with what's unique, ends with the catch-all).
- **Constants update:** Replace the 14-item `CATEGORIES` array with these 5. Update the `Category` type. Run a migration to remap existing templates.
