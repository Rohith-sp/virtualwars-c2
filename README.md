# 🗳️ VoteGuide India — AI-Powered Civic Intelligence Platform

> An intelligent, multilingual voter education platform built for India's 96 crore+ registered voters. From voter registration to real-time manifesto analysis, VoteGuide India makes democracy accessible.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Firebase](https://img.shields.io/badge/Firebase-App_Hosting-orange?logo=firebase)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-Flash-blue?logo=google)](https://ai.google.dev)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3-green)](https://groq.com)
[![i18n](https://img.shields.io/badge/Languages-9-purple)](https://next-intl-docs.vercel.app)

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Live Features](#live-features)
3. [System Architecture](#system-architecture)
4. [Tech Stack](#tech-stack)
5. [AI Provider Chain](#ai-provider-chain)
6. [Internationalization](#internationalization)
7. [Project Structure](#project-structure)
8. [Environment Variables](#environment-variables)
9. [Local Development](#local-development)
10. [Deployment](#deployment)
11. [API Reference](#api-reference)
12. [Design Philosophy](#design-philosophy)

---

## Overview

VoteGuide India is a full-stack Next.js 14 application that uses **Google Gemini** (with **Groq/LLaMA** as fallback) to power civic AI tools for Indian voters. It covers the complete election lifecycle — from voter registration (Form 6) to polling day — in **9 Indian languages**.

The platform was built as a hackathon project demonstrating how AI can democratize access to civic information at scale.

---

## Live Features

### 🤖 AI VoteIQ Chat
- Conversational AI assistant trained on ECI (Election Commission of India) rules
- Multi-turn conversation memory with session history
- Responds in the user's selected language
- Covers: voter registration, EPIC cards, Forms 6/7/8/8A, EVMs, NOTA, polling day rules

### ⚖️ Party Manifesto Comparator
- Select any two parties + a policy topic (Education, Healthcare, Economy, etc.)
- AI synthesizes real 2024 Lok Sabha manifesto promises into a side-by-side comparison
- Returns structured JSON: key promises per party + neutral AI verdict
- Built to save voters from reading 50-page PDFs

### 🔍 Election Myth-Buster
- Paste any viral WhatsApp forward or claim about Indian elections
- AI fact-checks it against official ECI rules and constitutional law
- Returns verdict (TRUE/FALSE/PARTIALLY TRUE/MISLEADING/UNVERIFIABLE) + explanation + official source citation
- Combats election misinformation in real-time

### 🔎 Candidate Background Search
- Search 2024 Lok Sabha candidates by constituency
- Shows education, declared assets, criminal cases (from ECI affidavit data)
- Sourced from `data/candidates.json` (ECI public data)

### 📍 Polling Booth Locator
- Interactive Leaflet.js map showing nearest polling booth
- SMS fallback instructions (1950 Voter Helpline)
- Pincode-based search with ECI API integration

### 🗳️ Voting Simulation (EVM)
- Realistic Electronic Voting Machine simulation
- Step-by-step walk-through of the polling booth experience
- Multilingual candidate names and party names

### 📋 Electoral Forms Guide
- Plain-language explanations of Forms 6, 7, 8, 8A
- Step-by-step filing guides with document checklists
- Direct links to voters.eci.gov.in

### 🪪 EPIC Number Validator
- Real-time format validation (3 letters + 7 digits)
- One-click copy to clipboard

### 🎴 Voter Pride Share Card
- Download a personalized "I Will Vote" card as PNG
- Canvas-rendered, shareable on WhatsApp/Instagram

### 📅 Election Timeline
- Animated visual timeline of the complete election cycle
- From announcement → nominations → campaign → polling → counting

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  Next.js 14 App Router · React 18 · Vanilla CSS · next-intl    │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Chat UI  │  │Manifesto │  │MythBuster│  │  All Other   │  │
│  │          │  │Comparator│  │          │  │  Components  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────────┘  │
└───────┼─────────────┼─────────────┼──────────────────────────-─┘
        │             │             │
        ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js API Routes (Edge/Node)                │
│                                                                 │
│  /api/chat      /api/manifesto    /api/mythbuster               │
│  /api/candidates                                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  lib/aiProvider.js                       │  │
│  │                                                          │  │
│  │  Priority 1: GEMINI_API_KEY  → gemini-flash-latest       │  │
│  │  Priority 2: GEMINI_API_KEY_2 → gemini-flash-latest      │  │
│  │  Priority 3: GROQ_API_KEY   → llama-3.3-70b-versatile   │  │
│  │                                                          │  │
│  │  Automatic failover on: 429 (rate limit) / 400 (expired) │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
        │             │             │
        ▼             ▼             ▼
┌───────────────┐ ┌────────────┐ ┌──────────────────────────────┐
│  Google AI    │ │  Groq API  │ │   ECI Static Data            │
│  (Gemini)     │ │  (LLaMA)   │ │   candidates.json            │
│               │ │            │ │   flows/*.json               │
└───────────────┘ └────────────┘ └──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Infrastructure                               │
│                                                                 │
│  Firebase App Hosting (Production)                              │
│  ├── Automatic HTTPS + CDN                                      │
│  ├── Secret Manager for API keys                                │
│  └── apphosting.yaml configuration                              │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow (AI Features)

```
User submits question/comparison/claim
        ↓
Next.js API Route validates input
        ↓
lib/aiProvider.generateText() called
        ↓
Try Gemini Key 1 ──→ Success? Return response
        ↓ (429/400/403)
Try Gemini Key 2 ──→ Success? Return response
        ↓ (still failing)
Try Groq LLaMA   ──→ Success? Return response
        ↓ (all failed)
Return 502 with user-friendly error
```

### i18n Request Flow

```
User visits /
        ↓
middleware.js detects Accept-Language header
        ↓
Redirects to /{locale}/ (e.g. /hi/, /bn/)
        ↓
app/[locale]/layout.js loads messages/{locale}.json
        ↓
Deep-merged with en.json (fallback for missing keys)
        ↓
NextIntlClientProvider wraps entire app
        ↓
All components call useTranslations() hook
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR, routing, API routes |
| **Language** | JavaScript (ES2022+) | — |
| **Styling** | Vanilla CSS (globals.css) | No framework lock-in |
| **Fonts** | Google Fonts via next/font | Playfair Display, DM Sans + 7 Indic scripts |
| **AI Primary** | Google Gemini Flash | Chat, manifesto analysis, fact-checking |
| **AI Fallback** | Groq (LLaMA 3.3 70B) | Automatic failover |
| **i18n** | next-intl | 9-language routing + translation |
| **Maps** | Leaflet.js | Polling booth locator |
| **Monitoring** | Sentry | Error tracking |
| **Analytics** | Google Analytics 4 | Usage metrics |
| **Rate Limiting** | Upstash Redis (optional) | API abuse prevention |
| **Deployment** | Firebase App Hosting | Production hosting |
| **CI/CD** | GitHub → Firebase | Auto-deploy on push |

---

## AI Provider Chain

All three AI-powered endpoints share a single provider abstraction in `lib/aiProvider.js`:

```
GEMINI_API_KEY     → gemini-flash-latest (fastest, most capable)
GEMINI_API_KEY_2   → gemini-flash-latest (backup key, same model)
GROQ_API_KEY       → llama-3.3-70b-versatile (free, high rate limits)
```

**Failover triggers:** HTTP 400 (expired key), 403 (forbidden), 429 (rate limited)

**Key functions:**
- `generateText(prompt, opts)` — Single-turn generation (manifesto, mythbuster)
- `generateChat({ systemInstruction, contents, locale }, opts)` — Multi-turn chat with history
- `extractJSON(text)` — Safely parses JSON from AI response, handles markdown fences

---

## Internationalization

9 languages supported with full UI translation:

| Code | Language | Script |
|---|---|---|
| `en` | English | Latin |
| `hi` | Hindi | Devanagari |
| `bn` | Bengali | Bengali |
| `te` | Telugu | Telugu |
| `ta` | Tamil | Tamil |
| `mr` | Marathi | Devanagari |
| `gu` | Gujarati | Gujarati |
| `kn` | Kannada | Kannada |
| `pa` | Punjabi | Gurmukhi |

**Architecture:**
- `messages/{locale}.json` — translation files
- `i18n.js` — deep-merge logic: missing keys fall back to English
- `middleware.js` — auto-detects browser language and redirects
- All 9 Indic Google Fonts loaded in `app/layout.js` with `font-display: swap`

---

## Project Structure

```
hackathon/
├── app/
│   ├── layout.js               # Root layout — owns <html><body>, all fonts
│   ├── globals.css             # All CSS (design tokens, components, animations)
│   ├── global-error.js         # Top-level React error boundary (Sentry)
│   ├── error.js                # Route-level error UI
│   ├── [locale]/
│   │   ├── layout.js           # Locale layout — NextIntlClientProvider, GA
│   │   └── page.js             # Main page — navbar + all sections
│   └── api/
│       ├── chat/route.js       # POST /api/chat — AI conversational assistant
│       ├── manifesto/route.js  # POST /api/manifesto — party comparison
│       ├── mythbuster/route.js # POST /api/mythbuster — claim fact-checker
│       └── candidates/route.js # GET  /api/candidates — constituency search
├── components/
│   ├── ChatWindow.jsx          # AI chat sidebar with history
│   ├── ManifestoCompare.jsx    # Party manifesto side-by-side
│   ├── MythBuster.jsx          # Viral claim fact-checker
│   ├── CandidateSearch.jsx     # Constituency candidate lookup
│   ├── BoothLocator.jsx        # Polling booth finder UI
│   ├── BoothMap.jsx            # Leaflet map wrapper
│   ├── SimulationModal.jsx     # EVM voting simulation
│   ├── FlowChat.jsx            # Guided step-by-step chatbot
│   ├── FormCard.jsx            # Electoral form explainer
│   ├── EpicFormatter.jsx       # EPIC number validator
│   ├── ShareCard.jsx           # Voter pride card generator
│   ├── TimelineBanner.jsx      # Election timeline animation
│   ├── FactsTicker.jsx         # Did-you-know ticker
│   ├── ProblemCard.jsx         # Common voter problems + solutions
│   ├── LanguageSwitcher.jsx    # 9-language switcher
│   ├── ErrorBoundary.jsx       # Per-section error isolation
│   ├── SkipLink.jsx            # Accessibility skip-to-content
│   ├── Toast.jsx               # Global notification system
│   └── ConfettiOverlay.jsx     # Vote celebration animation
├── lib/
│   ├── aiProvider.js           # Gemini → Groq fallback chain
│   ├── rateLimiter.js          # Upstash Redis rate limiting
│   ├── flowEngine.js           # Guided chatbot flow logic
│   ├── analytics.js            # GA4 event helpers
│   └── useScrollReveal.js      # Intersection Observer hook
├── messages/
│   ├── en.json                 # English (source of truth)
│   ├── hi.json                 # Hindi
│   ├── bn.json                 # Bengali
│   ├── te.json                 # Telugu
│   ├── ta.json                 # Tamil
│   ├── mr.json                 # Marathi
│   ├── gu.json                 # Gujarati
│   ├── kn.json                 # Kannada
│   └── pa.json                 # Punjabi
├── data/
│   ├── candidates.json         # 2024 Lok Sabha candidate ECI data
│   └── flows/                  # Guided chatbot flows (9 languages)
├── i18n.js                     # next-intl config + deep-merge fallback
├── middleware.js               # Locale detection + redirect
├── next.config.mjs             # Next.js + Sentry + next-intl config
├── apphosting.yaml             # Firebase App Hosting config
├── firebase.json               # Firebase project config
└── .env.local.example          # Environment variable template
```

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
# Primary AI key (Google AI Studio → aistudio.google.com/app/apikey)
GEMINI_API_KEY=AIzaSy...

# Backup Gemini key (optional but recommended)
GEMINI_API_KEY_2=AIzaSy...

# Groq fallback — free at console.groq.com/keys
GROQ_API_KEY=gsk_...

# Google Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

> ⚠️ **Never commit `.env.local`** — it's in `.gitignore`. For production, use Firebase Secret Manager.

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/Rohith-sp/virtualwars-c2.git
cd virtualwars-c2

# 2. Install
npm install

# 3. Configure
cp .env.local.example .env.local
# Edit .env.local with your API keys

# 4. Run
npm run dev
# → http://localhost:3000
```

The app auto-redirects to your browser's preferred language on first load.

---

## Deployment

See **`DEPLOY.md`** (local file, not in git) for step-by-step Firebase App Hosting deployment instructions including Secret Manager setup for production API keys.

Quick deploy after setup:
```bash
firebase deploy
```

---

## API Reference

### `POST /api/chat`
AI civic education assistant.

**Request:**
```json
{
  "question": "How do I register to vote?",
  "history": [{ "role": "user", "content": "..." }, { "role": "assistant", "content": "..." }],
  "locale": "hi"
}
```

**Response:**
```json
{ "answer": "मतदाता पंजीकरण के लिए..." }
```

---

### `POST /api/manifesto`
Compare two parties' 2024 manifesto promises on a topic.

**Request:**
```json
{
  "party1": "BJP (Bharatiya Janata Party)",
  "party2": "INC (Indian National Congress)",
  "topic": "Education",
  "locale": "en"
}
```

**Response:**
```json
{
  "comparison": {
    "topic": "Education",
    "party1": { "name": "BJP", "keyPromises": [...], "summary": "..." },
    "party2": { "name": "INC", "keyPromises": [...], "summary": "..." },
    "verdict": "Both parties prioritize..."
  }
}
```

---

### `POST /api/mythbuster`
Fact-check a viral claim about Indian elections.

**Request:**
```json
{
  "claim": "You can vote using only your mobile phone on election day",
  "locale": "en"
}
```

**Response:**
```json
{
  "result": {
    "verdict": "FALSE",
    "verdictEmoji": "❌",
    "explanation": "Mobile phones cannot be used to cast votes...",
    "officialSource": "Representation of the People Act, 1951",
    "tip": "Always carry your EPIC card or any of the 12 approved photo IDs."
  }
}
```

---

### `GET /api/candidates?q={constituency}`
Search 2024 Lok Sabha candidates by constituency name.

**Response:**
```json
[
  {
    "name": "Candidate Name",
    "party": "Party Name",
    "constituency": "New Delhi",
    "education": "Post Graduate",
    "assets": "₹2.5 Cr",
    "criminal_cases": 0
  }
]
```

---

## Design Philosophy

### 1. Accessibility First
- Skip-to-content link for keyboard users
- ARIA labels on all interactive elements
- 9 Indic scripts loaded as proper Unicode fonts (not images)
- High contrast ratios throughout

### 2. Progressive Enhancement
- Server-rendered HTML for all static content
- AI features degrade gracefully (errors shown inline, never crash)
- Each section wrapped in `<ErrorBoundary>` for isolation

### 3. AI as a Tool, Not Oracle
- AI responses always cite official ECI sources
- Myth-Buster explicitly states "UNVERIFIABLE" when uncertain
- Manifesto Comparator warns: "Verify with official party sources"
- No AI-generated content replaces official government information

### 4. Privacy by Design
- No user data stored
- No login required
- AI keys are server-side only (never exposed to client)
- Rate limiting prevents abuse

### 5. Language Equity
- All 9 languages are first-class citizens
- Missing translations fall back to English (never crash)
- Indic fonts loaded with `font-display: swap` for fast initial render
- Language preference persisted via URL path (`/hi/`, `/ta/`, etc.)

---

## Contributing

Pull requests welcome. Please:
1. Keep components under `components/` — no logic in `app/[locale]/page.js`
2. Add translation keys to `messages/en.json` first
3. Test in at least 2 languages before submitting

---

## License

MIT — Free for civic, educational, and non-commercial use.

---

*Built with ❤️ for Indian democracy · Data source: Election Commission of India (eci.gov.in)*
