import { ratelimit } from '@/lib/rateLimiter';
import { generateChat } from '@/lib/aiProvider';

// ── Gemini request timeout ────────────────────────────────────────────────────
const GEMINI_TIMEOUT_MS = 8000;

// ── Startup / build-time environment validation ───────────────────────────────
// Throws at module-load time so a misconfigured deployment fails fast rather
// than surfacing as a 503 to the first real user.
// Validation moved inside POST to avoid build-time errors

// ── CORS helpers ──────────────────────────────────────────────────────────────
function getAllowedOrigins() {
  const origins = (process.env.ALLOWED_ORIGINS ?? process.env.ALLOWED_ORIGIN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  
  // Default for local development
  if (origins.length === 0) {
    return ['http://localhost:3000', 'http://127.0.0.1:3000'];
  }
  return origins;
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
  // Keys are validated inside aiProvider — just check at least one exists
  const hasAnyKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2 || process.env.GROQ_API_KEY;
  if (!hasAnyKey) {
    console.error('[VoteGuide] No AI provider keys configured');
    return Response.json({ error: 'AI service not configured.' }, { status: 500 });
  }

  // ── CORS check ────────────────────────────────────────────────────────────
  const origin = request.headers.get('origin') ?? '';
  const allowedOrigins = getAllowedOrigins();
  // Same-origin requests have no Origin header — always allow.
  if (origin && !allowedOrigins.includes(origin)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  const corsHeaders = origin ? buildCorsHeaders(origin) : {};

  // ── Rate limiting (Optional) ──────────────────────────────────────────────
  if (ratelimit) {
    try {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return Response.json(
          { error: 'Too many requests. Please wait.' },
          { status: 429, headers: corsHeaders },
        );
      }
    } catch (e) {
      console.warn('[VoteGuide] Rate limiting failed:', e.message);
      // Fail open so chat remains usable if Redis is down
    }
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

  const { question, history = [], locale = 'en' } = body ?? {};

  if (typeof question !== 'string' || question.trim().length === 0) {
    return Response.json({ error: 'Field "question" is required.' }, { status: 400, headers: corsHeaders });
  }

  // Map history to Gemini format (assistant -> model)
  const contents = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content || msg.text || '' }]
  }));

  // Add current question if not already in history
  if (contents.length === 0 || contents[contents.length - 1].parts[0].text !== question) {
    contents.push({ role: 'user', parts: [{ text: question }] });
  }

  // ── Call Gemini API (server-side only — key never sent to client) ──────────
  const LANGUAGE_NAMES = {
    en: 'English', hi: 'Hindi', bn: 'Bengali', te: 'Telugu',
    ta: 'Tamil', mr: 'Marathi', gu: 'Gujarati', kn: 'Kannada', pa: 'Punjabi'
  };
  const langName = LANGUAGE_NAMES[locale] || 'English';

  const SYSTEM_INSTRUCTION =
    `You are VoteIQ, a civic education assistant for Indian elections.
IMPORTANT: Always respond in ${langName} only.
Keep answers factual and complete. Use structured formatting for better readability:
- Use bullet points for lists.
- Use **bold text** for emphasis on key terms.
- Use double newlines to separate paragraphs.
Cite the Election Commission of India (ECI) as the source.
Answer ONLY questions about voter registration, EPIC cards, Forms 6/7/8/8A, voting procedures, EVMs, NOTA, and ECI rules.`;

  try {
    const answer = await generateChat(
      { systemInstruction: SYSTEM_INSTRUCTION, contents, locale },
      { temperature: 0.2, timeoutMs: GEMINI_TIMEOUT_MS }
    );
    return Response.json({ answer }, { status: 200, headers: corsHeaders });
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      console.error('AI timeout');
      return Response.json(
        { error: 'The AI service is taking too long. Please try again.' },
        { status: 504, headers: corsHeaders },
      );
    }
    console.error('AI error:', error.message);
    return Response.json(
      { error: 'AI service error. Please try again.' },
      { status: 502, headers: corsHeaders },
    );
  }
}
