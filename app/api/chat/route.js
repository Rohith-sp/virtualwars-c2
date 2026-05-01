import * as Sentry from '@sentry/nextjs';
import { ratelimit } from '@/lib/rateLimiter';

// ── Gemini request timeout ────────────────────────────────────────────────────
const GEMINI_TIMEOUT_MS = 8000;

// ── Startup / build-time environment validation ───────────────────────────────
// Throws at module-load time so a misconfigured deployment fails fast rather
// than surfacing as a 503 to the first real user.
// Validation moved inside POST to avoid build-time errors

// ── CORS helpers ──────────────────────────────────────────────────────────────
function getAllowedOrigins() {
  return (process.env.ALLOWED_ORIGINS ?? process.env.ALLOWED_ORIGIN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildCorsHeaders(origin) {
  return { 'Access-Control-Allow-Origin': origin };
}

// ── Preflight handler ─────────────────────────────────────────────────────────
export async function OPTIONS(request) {
  const origin = request.headers.get('origin') ?? '';
  const allowedOrigins = getAllowedOrigins();

  if (origin && !allowedOrigins.includes(origin)) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request) {
  const REQUIRED_ENV_VARS = [
    'GEMINI_API_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
  ];
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      console.error(`[VoteGuide] Missing required environment variable: ${key}`);
      return Response.json({ error: 'Server misconfiguration.' }, { status: 500 });
    }
  }

  // ── CORS check ────────────────────────────────────────────────────────────
  const origin = request.headers.get('origin') ?? '';
  const allowedOrigins = getAllowedOrigins();
  // Same-origin requests have no Origin header — always allow.
  if (origin && !allowedOrigins.includes(origin)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  const corsHeaders = origin ? buildCorsHeaders(origin) : {};

  // ── Rate limiting (Upstash Redis, sliding window) ─────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return Response.json(
      { error: 'Too many requests. Please wait.' },
      { status: 429, headers: corsHeaders },
    );
  }

  // ── Validate request body ─────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON body.' },
      { status: 400, headers: corsHeaders },
    );
  }

  const { question, locale = 'en' } = body ?? {};

  if (typeof question !== 'string' || question.trim().length === 0) {
    return Response.json(
      { error: 'Field "question" is required.' },
      { status: 400, headers: corsHeaders },
    );
  }
  if (question.length > 500) {
    return Response.json(
      { error: 'Question exceeds 500-character limit.' },
      { status: 400, headers: corsHeaders },
    );
  }

  // Sanitise: strip null bytes, control characters
  const safeQuestion = question
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
    .trim();

  // ── Call Gemini API (server-side only — key never sent to client) ──────────
  const apiKey = process.env.GEMINI_API_KEY;

  const LANGUAGE_NAMES = {
    en: 'English', hi: 'Hindi', bn: 'Bengali', te: 'Telugu',
    ta: 'Tamil', mr: 'Marathi', gu: 'Gujarati', kn: 'Kannada', pa: 'Punjabi'
  };
  const langName = LANGUAGE_NAMES[locale] || 'English';

  const SYSTEM_INSTRUCTION =
    `You are VoteIQ, a civic education assistant for Indian elections.
IMPORTANT: Always respond in ${langName} only, regardless of what language the user writes in. If the user writes in a different language, still reply in ${langName}.
Keep answers factual, under 150 words unless detail is requested.
Cite the Election Commission of India as the authoritative source.
Never give partisan opinions.
Answer ONLY questions about voter registration, EPIC cards, Forms 6/7/8/8A, voting procedures, EVMs, NOTA, and ECI rules. If the question is unrelated to Indian elections, politely say you can only help with election topics.`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents: [{ parts: [{ text: safeQuestion }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.3 },
        }),
      },
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', errText);
      return Response.json(
        { error: 'AI service error. Please try again.' },
        { status: 502, headers: corsHeaders },
      );
    }

    const data = await geminiRes.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      'Sorry, I could not generate an answer. Please try again.';

    return Response.json({ answer }, { status: 200, headers: corsHeaders });
  } catch (error) {
    // ── Timeout handling ────────────────────────────────────────────────────
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      console.error('Gemini API timeout after 8s');
      return Response.json(
        { error: 'The AI service is taking too long. Please try again.' },
        { status: 504, headers: corsHeaders },
      );
    }

    // ── Generic network / unexpected error ──────────────────────────────────
    console.error('Fetch error:', error);
    Sentry.captureException(error, { extra: { question: safeQuestion } });
    return Response.json(
      { error: 'Network error reaching AI service.' },
      { status: 502, headers: corsHeaders },
    );
  }
}
