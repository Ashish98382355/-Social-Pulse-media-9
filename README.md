# SocialPulse

A feature-rich social media platform with a dark glassmorphism UI, AI-powered post tools, and privacy-first design. Built with TanStack Start and deployed on Netlify.

## Features

- **Pulse (Posts)** — Create, edit, delete and like posts with a character counter
- **AI Tools** — Enhance posts, change tone, generate hashtags, get viral score predictions, detect sentiment, summarize long posts, and more — all powered by Gemini AI via Netlify AI Gateway
- **Follow / Unfollow** — Build your social graph with follow-back support
- **Elite Badges** — Special badges for 1L, 10L and Crore+ followers
- **Trending** — Social Good posts sorted by likes appear in the Trending tab
- **Profile** — Editable profiles with photo, bio, profession, parents name, location, and a privacy-protected phone number
- **Chat** — Real-time messaging between members with AI smart reply suggestions
- **Search** — Find people and pulses by name or content
- **Privacy** — Phone and address are stored encrypted client-side and never shown publicly

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (React 19, TanStack Router v1) |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 (dark glassmorphism theme) |
| AI | Gemini 2.5-flash via Netlify AI Gateway |
| Deployment | Netlify (Functions + AI Gateway) |
| Language | TypeScript 5.7 (strict mode) |

## Running Locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000` (or via Netlify Dev at `http://localhost:8888` for full Functions support including AI features).

```bash
# To use AI features locally, run via Netlify CLI:
netlify dev
```

## AI Features

All AI calls route through `/api/ai` (a Netlify Function at `netlify/functions/ai.mts`). The function uses Gemini 2.5-flash via Netlify AI Gateway — no API keys needed when deployed to Netlify.

Supported actions: `enhance`, `summarize`, `sentiment`, `hashtags`, `tone`, `reply`, `viral_score`, `safety`, `complete`, `image_prompt`

## Data Persistence

User data, posts, and messages are stored in `localStorage` for this demo. All data is client-side only.
