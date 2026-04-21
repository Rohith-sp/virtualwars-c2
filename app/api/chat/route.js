import { headers } from 'next/headers';

// ── In-memory rate limiter ────────────────────────────────────────────────
// Intentionally simplified for hackathon demo (resets on cold start).
// Production alternative: Redis / Upstash with atomic INCR + EXPIRE.
const rateLimitMap = new Map(); // ip -> { count: number, resetAt: number }
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) ?? { count: 0, resetAt: now + WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }
  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return entry.count <= RATE_LIMIT;
}

// ── Route handler ─────────────────────────────────────────────────────────
export async function POST(request) {
  // Get client IP from forwarded header (works on Vercel / behind proxy)
  const headersList = headers();
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: 'Rate limit exceeded. Max 10 requests per minute.' },
      { status: 429 },
    );
  }

  // ── Validate request body ────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { question } = body ?? {};

  if (typeof question !== 'string' || question.trim().length === 0) {
    return Response.json({ error: 'Field "question" is required.' }, { status: 400 });
  }
  if (question.length > 500) {
    return Response.json({ error: 'Question exceeds 500-character limit.' }, { status: 400 });
  }

  // Sanitise: strip null bytes, control characters
  const safeQuestion = question.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '').trim();

  // ── Call Gemini API (server-side only — key never sent to client) ─────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'AI service not configured.' }, { status: 503 });
  }

  const SYSTEM_INSTRUCTION =
    'You are a concise Indian election guide. Answer ONLY questions about voter registration, EPIC cards, Forms 6/7/8/8A, voting procedures, EVMs, NOTA, and ECI rules. Keep answers under 120 words and in plain prose — no markdown. If the question is unrelated to Indian elections, politely say you can only help with election topics.';

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      return Response.json({ error: 'AI service error. Please try again.' }, { status: 502 });
    }

    const data = await geminiRes.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      'Sorry, I could not generate an answer. Please try again.';

    return Response.json({ answer });
  } catch (err) {
    console.error('Fetch error:', err);
    return Response.json({ error: 'Network error reaching AI service.' }, { status: 502 });
  }
}
