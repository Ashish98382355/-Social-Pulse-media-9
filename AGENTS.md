# AGENTS.md

This document describes the SocialPulse project architecture for AI agents and developers.

## Project Overview

SocialPulse is a feature-rich social media platform built with TanStack Start and deployed on Netlify. It features a dark glassmorphism UI (purple-blue gradient theme), AI-powered post tools via Gemini, follow/chat/like mechanics, profile editing, elite badges, privacy-first design, and a trending section that prioritizes social good content.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (React 19, TanStack Router v1) |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 (dark glassmorphism theme) |
| AI | Gemini 2.5-flash via Netlify AI Gateway |
| Deployment | Netlify (Functions + AI Gateway) |
| Language | TypeScript 5.7 (strict mode) |

## Directory Structure

```
├── netlify/
│   └── functions/
│       └── ai.mts           # Gemini AI endpoint via Netlify AI Gateway (/api/ai)
├── public/
│   └── favicon.ico
├── src/
│   ├── routes/
│   │   ├── __root.tsx       # Root layout: metadata, global styles
│   │   └── index.tsx        # ENTIRE SocialPulse app — all components live here
│   ├── router.tsx           # TanStack Router setup with scroll restoration
│   └── styles.css           # Tailwind import + custom scrollbar styling
├── netlify.toml             # Build: vite build, publish: dist/client
├── package.json
├── tsconfig.json            # Strict TS, @/* alias for src/*
└── vite.config.ts           # TanStack Start + Netlify + Tailwind plugins
```

## Key Architecture Decisions

### Single-File App (`src/routes/index.tsx`)
All SocialPulse UI components are in one file. Components: `AuthModal`, `Av` (Avatar), `Composer`, `PostCard`, `ProfilePage`, `ChatPanel`, `TrendingSidebar`, `Notifications`, `SocialPulseApp` (root).

### Data Layer
All data (users, posts, messages) stored in `localStorage` via the `ls` helper. Keys prefixed with `sp_`. Seed data (`SEED_USERS`, `SEED_POSTS`) populates on first load. Client-side prototype — no backend database.

### AI Function (`netlify/functions/ai.mts`)
- Path: `/api/ai`
- Method: POST `{ action: string, text: string, context?: string }`
- Uses `@google/genai` with Netlify AI Gateway (zero-config, no API key needed on Netlify)
- Model: `gemini-2.5-flash`
- Supported actions: `enhance`, `summarize`, `sentiment`, `hashtags`, `tone`, `reply`, `viral_score`, `safety`, `complete`, `image_prompt`

### Styling Constants
Defined at top of `src/routes/index.tsx`:
- `glass` — dark glassmorphism card style
- `gHover` — hover state for glass elements
- `purp` — purple-to-blue gradient (primary CTA color)
- `purpHover` — gradient hover state
- `btn` — base button padding/radius/transition

### Privacy
- Phone and address fields exist in `UserProfile` but are never rendered publicly
- Profile page shows phone as masked (last 4 digits) only to the owner
- AI safety check runs before every post is submitted

### Elite Badges
`getEliteBadge(followerCount)` returns badge:
- 100k+ → ⭐ 1L Elite (blue/cyan)
- 1M+ → 🏆 10L Elite (fuchsia/pink)
- 10M+ → 💎 Crore Elite (yellow/amber)

### Trending
Posts with `category: 'social_good'` (auto-detected by keywords like water, health, education, environment) appear in the Trending tab sorted by like count.

## Development Commands

```bash
npm run dev      # Start dev server (port 3000)
netlify dev      # Start with Netlify Functions support (port 8888) — use this for AI features
npm run build    # Production build
```

## Conventions

### Naming
- Components: PascalCase
- Utilities: camelCase, short (`ls`, `uid`, `aiCall`, `Av`)
- Routes: kebab-case files

### TypeScript
- Strict mode enabled
- Import paths use `@/` alias for `src/*`
- Interfaces for all data models at top of `index.tsx`

### State Management
- All state in root `SocialPulseApp` via `useState`
- Passed down as props to child components
- No context or Zustand used

## Adding Features
- New pages → add a file in `src/routes/`
- New AI actions → add to `PROMPTS` map in `netlify/functions/ai.mts` and call via `aiCall()` in the component
- New profile fields → extend `UserProfile` interface + `ProfilePage` form + `updateProfile` handler
- Backend persistence → replace `ls.get/set` calls with Netlify Blobs or Netlify Database API calls via server functions
