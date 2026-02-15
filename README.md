# Molt Mart 🦀

A marketplace for buying and selling OpenClaw AI agent templates. Built with Next.js, Supabase, and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage)
- **Styling:** Tailwind CSS + shadcn/ui
- **Payments:** Stripe (planned)
- **Deployment:** Vercel

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Sproutyai/MoltMart.git
cd MoltMart
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Setup

Run `supabase/schema.sql` in your Supabase SQL Editor to create all required tables, RLS policies, and storage buckets.

### 4. Development

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # Lint check
```

## Features

- 🔐 Auth (sign up, login, magic link via Supabase)
- 🛒 Browse & search templates by category
- ⬆️ Sellers can upload `.zip` template packages
- ⬇️ Buyers can download purchased templates
- ⭐ Review & rating system
- 📊 Seller dashboard with upload management
- 🎨 Clean, responsive UI with shadcn/ui components

## Project Structure

```
src/
├── app/           # Next.js App Router pages & API routes
├── components/    # React components (UI, forms, layout)
├── lib/           # Supabase clients, utilities
supabase/
└── schema.sql     # Database schema & RLS policies
```

## Deployment

Push to `main` to auto-deploy on Vercel. Set the three env vars in your Vercel project settings.

## License

Private — © Sprouty AI
