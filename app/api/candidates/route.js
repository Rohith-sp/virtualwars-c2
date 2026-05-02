// Native AbortSignal.timeout is available in Node 18+ (no import needed)

const GEMINI_TIMEOUT_MS = 10000;

async function callGemini(apiKey, prompt) {
  // Use gemini-1.5-pro for better factual accuracy if available, fallback to flash
  const model = "gemini-1.5-pro-latest"; 
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            response_mime_type: "application/json",
            temperature: 0.0, // Minimum temperature for maximum factual consistency
          },
        }),
      }
    );
    
    if (!res.ok) {
      return callGeminiFlash(apiKey, prompt);
    }
    
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text);
  } catch (e) {
    return callGeminiFlash(apiKey, prompt);
  }
}

async function callGeminiFlash(apiKey, prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.0 
        },
      }),
    }
  );
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const constituency = searchParams.get('constituency');

  if (!constituency) {
    return Response.json({ error: 'Constituency is required' }, { status: 400 });
  }

  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2
  ].filter(Boolean);

  if (keys.length === 0) {
    return Response.json({ error: 'AI service not configured' }, { status: 500 });
  }

  const prompt = `You are a factual database of Indian Election results. 
Task: Return the list of actual major candidates who contested in the ${constituency} constituency during the 2024 Indian Lok Sabha Elections.

CRITICAL INSTRUCTIONS:
1. DO NOT HALLUCINATE. Only provide real names of real people.
2. If you are not 100% certain about the candidates for "${constituency}", return an empty array [].
3. For each candidate, provide their actual political party (e.g., BJP, INC, AAP, TMC, etc.).
4. Fetch or estimate their actual background data (Education, Assets, Criminal Cases) from MyNeta/ADR/ECI data available in your training set.
5. Provide a valid URL to their profile (Wikipedia or news profile).

Return ONLY a JSON array of objects with these keys:
- id: unique string
- name: real full name
- party: real party name
- education: real qualification
- assets: real asset value
- criminalCases: real number of cases
- age: real age
- profileUrl: real verified URL

Limit to the top 5 candidates.
STRICT: If data is unavailable, return []. Never make up names.`;

  for (let i = 0; i < keys.length; i++) {
    try {
      const candidates = await callGemini(keys[i], prompt);
      return Response.json({ candidates });
    } catch (error) {
      console.error(`Attempt ${i+1} failed:`, error.message);
      if (i === keys.length - 1) {
        return Response.json({ error: 'Failed to fetch candidate data' }, { status: 502 });
      }
    }
  }
}
