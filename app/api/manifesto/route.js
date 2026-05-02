import { generateText, extractJSON } from '@/lib/aiProvider';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { party1, party2, topic, locale = 'en' } = body ?? {};

  if (!party1 || !party2 || !topic) {
    return Response.json({ error: 'party1, party2, and topic are required.' }, { status: 400 });
  }

  const LANGUAGE_NAMES = {
    en: 'English', hi: 'Hindi', bn: 'Bengali', te: 'Telugu',
    ta: 'Tamil', mr: 'Marathi', gu: 'Gujarati', kn: 'Kannada', pa: 'Punjabi'
  };
  const langName = LANGUAGE_NAMES[locale] || 'English';

  const prompt = `You are a factual Indian political analyst.
Compare the 2024 Lok Sabha election manifestos of "${party1}" and "${party2}" on the topic of "${topic}".

STRICT RULES:
1. Respond ONLY in ${langName}.
2. Base your answer on their actual 2024 general election manifesto promises. If uncertain, say so.
3. Be fair, balanced, and non-partisan.
4. Do NOT invent promises. Only cite real positions.

Return a JSON object with this EXACT structure (no markdown, no explanation, just raw JSON):
{
  "topic": "${topic}",
  "party1": {
    "name": "${party1}",
    "keyPromises": ["Promise 1", "Promise 2", "Promise 3"],
    "summary": "One sentence summary of their position."
  },
  "party2": {
    "name": "${party2}",
    "keyPromises": ["Promise 1", "Promise 2", "Promise 3"],
    "summary": "One sentence summary of their position."
  },
  "verdict": "A single neutral sentence on how they differ or agree on this topic."
}`;

  try {
    const text = await generateText(prompt, { temperature: 0.1, timeoutMs: 20000 });
    const comparison = extractJSON(text);
    return Response.json({ comparison });
  } catch (error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return Response.json({ error: 'Request timed out. Please try again.' }, { status: 504 });
    }
    console.error('Manifesto API error:', error.message);
    return Response.json({ error: 'Failed to generate comparison. Please try again.' }, { status: 502 });
  }
}
