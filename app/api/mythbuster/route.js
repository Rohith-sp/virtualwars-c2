import { generateText, extractJSON } from '@/lib/aiProvider';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { claim, locale = 'en' } = body ?? {};

  if (!claim || typeof claim !== 'string' || claim.trim().length < 5) {
    return Response.json({ error: 'A valid claim is required.' }, { status: 400 });
  }

  const LANGUAGE_NAMES = {
    en: 'English', hi: 'Hindi', bn: 'Bengali', te: 'Telugu',
    ta: 'Tamil', mr: 'Marathi', gu: 'Gujarati', kn: 'Kannada', pa: 'Punjabi'
  };
  const langName = LANGUAGE_NAMES[locale] || 'English';

  const prompt = `You are VoteIQ, a trusted Indian election fact-checker.
A user has submitted this claim for fact-checking: "${claim.trim()}"

STRICT RULES:
1. Respond ONLY in ${langName}.
2. Check this claim ONLY against official Election Commission of India (ECI) rules, Indian constitutional law, or verified news about Indian elections.
3. Be specific — cite the exact ECI rule or law that proves/disproves the claim.
4. If the claim is not about Indian elections, say so politely.
5. Do NOT guess. If unsure, say "Unverifiable."

Return a JSON object with this EXACT structure (no markdown, no explanation, just raw JSON):
{
  "verdict": "TRUE or FALSE or PARTIALLY TRUE or MISLEADING or UNVERIFIABLE",
  "verdictEmoji": "✅ or ❌ or ⚠️ or 🔶 or ❓",
  "explanation": "2-3 sentences explaining the verdict in ${langName}.",
  "officialSource": "The name of the official ECI rule, Act, or section that applies. If none, say General ECI Guidelines.",
  "tip": "One actionable tip for the voter in ${langName}."
}`;

  try {
    const text = await generateText(prompt, { temperature: 0.05, timeoutMs: 15000 });
    const result = extractJSON(text);
    return Response.json({ result });
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return Response.json({ error: 'Request timed out. Please try again.' }, { status: 504 });
    }
    console.error('MythBuster API error:', error.message);
    return Response.json({ error: 'Failed to fact-check claim. Please try again.' }, { status: 502 });
  }
}
