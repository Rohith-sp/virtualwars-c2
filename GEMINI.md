# VoteGuide India - Project Instructions

## Architecture & Conventions

VoteGuide India is a Next.js 14 application designed to assist Indian citizens with electoral processes. It prioritizes accessibility, speed, and AI-driven guidance.

### 1. Technology Stack
- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, Vanilla CSS (using CSS variables for theme), Glassmorphism aesthetic.
- **AI:** Google Gemini API (1.5-flash) via server-side route handlers.
- **Testing:** Jest for core logic.
- **Analytics:** Custom lightweight analytics module.

### 2. Core Modules
- **Flow Engine (`lib/flowEngine.js`):** A pure-function-based state machine that powers the guided voter journey. Logic is data-driven by `data/flows.json`.
- **Chat API (`app/api/chat/route.js`):** Server-side handler for Gemini AI integration with rate limiting and input sanitization.
- **UI Components (`components/`):** Highly modular, accessible components. Use `aria-` labels for all interactive elements.

### 3. Conventions
- **Client Components:** Use `'use client'` only when necessary for state or browser APIs.
- **Styling:** Prefer CSS variables defined in `globals.css`. Avoid hardcoding hex values.
- **Data:** Keep content in `data/*.json` to maintain a clean separation between logic and information.
- **Security:** Never expose `GEMINI_API_KEY` to the client. Keep AI system instructions robust to prevent prompt injection.

## Production Readiness Gaps (Current State)

The project is currently a functional prototype but requires the following improvements for production:

### 🛠 Critical Fixes & Improvements
1.  **Rate Limiting:** The current in-memory `Map` in `app/api/chat/route.js` is not scalable for production. Transition to **Redis/Upstash** for atomic rate limiting.
2.  **Error Handling:** Implement **Global Error Boundaries** in the App Router to prevent UI crashes from bubbling up.
3.  **Accessibility (a11y):** Perform a full audit of `SimulationModal.jsx` and `ChatWindow.jsx` to ensure screen reader compatibility and focus management.
4.  **SEO & Metadata:** Populate `layout.js` with proper OpenGraph, Twitter, and meta tags for better discoverability.
5.  **Environment Validation:** Add a startup check to ensure `GEMINI_API_KEY` is present and valid.

### 🧪 Testing & Validation
- Expand `tests/flowEngine.test.js` to cover all terminal nodes in `data/flows.json`.
- Add integration tests for the `/api/chat` route.
- Implement basic E2E tests for the "Try Simulation" flow.

### 📈 Performance
- Optimize `EpicFormatter.jsx` to handle various edge cases of EPIC number formats efficiently.
- Ensure dynamic imports for heavy components like `SimulationModal` are properly configured (already started in `app/page.js`).

## Development Workflow
- **Local Dev:** `npm run dev`
- **Testing:** `npm test`
- **Linting:** `npm run lint`
