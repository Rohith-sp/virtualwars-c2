# VoteGuide India — an interactive voter education tool for Indian elections, built with Next.js 14 and the Gemini API.

## What it does
VoteGuide India assists Indian citizens with electoral processes by providing an intuitive, interactive experience. The guided flow system (`flowEngine.js` + `flows.json`) directs users through a structured decision tree to find precise information. An AI chat (Gemini API via `/api/chat`) answers free-form questions specifically related to Indian elections. It also features a voting simulation, a personalized share card generation tool, and a polling booth locator.

## Tech stack
- Next.js 14 (App Router)
- React 18
- Gemini API (gemini-1.5-flash)
- Vanilla CSS
- html2canvas
- Jest
- Upstash Redis
- Sentry

## Getting started
1. Clone the repo
2. Run `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in the values.
   *(Note: The AI chat will not work without a valid GEMINI_API_KEY.)*
4. Run `npm run dev`
5. Open http://localhost:3000

## Environment variables
- `GEMINI_API_KEY` — Required. Your Google Gemini API key. Get one at https://aistudio.google.com/app/apikey
- `NEXT_PUBLIC_GA_ID` — Optional. Google Analytics 4 measurement ID (G-XXXXXXXX). Leave blank to disable analytics.
- `ALLOWED_ORIGIN` — Required in production. The full URL of your deployed site (e.g. https://voteguide.in). Used for CORS.
- `UPSTASH_REDIS_REST_URL` — Required in production. From your Upstash Redis dashboard.
- `UPSTASH_REDIS_REST_TOKEN` — Required in production. From your Upstash Redis dashboard.
- `NEXT_PUBLIC_SENTRY_DSN` — Required in production for error tracking.

## Project structure
- `app/` — Next.js 14 App Router pages, layouts, and API routes.
- `components/` — Reusable React UI components.
- `lib/` — Utility functions, analytics, flow engine logic, and rate limiting.
- `data/` — Static JSON data (flows, facts, forms, problems).
- `public/` — Static assets.

## How the flow engine works
`flows.json` defines a directed graph of nodes representing questions, info, and terminal states. `lib/flowEngine.js` provides pure functions to traverse this graph based on user input. `FlowChat.jsx` renders the current node and handles transitions gracefully.

## Running tests
Run `npm test` to execute the Jest suite. Currently, coverage includes `lib/flowEngine.js` only. Note that component tests do not yet exist.

## Contributing
Please run ESLint via `next lint` before submitting PRs. There is no Prettier config yet, but PRs are welcome!
