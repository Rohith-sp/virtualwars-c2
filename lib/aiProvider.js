/**
 * lib/aiProvider.js
 *
 * Unified AI provider with automatic multi-tier fallback:
 *   1. GEMINI_API_KEY   → gemini-2.0-flash  (primary)
 *   2. GEMINI_API_KEY_2 → gemini-2.0-flash  (backup key, separate quota)
 *   3. GROQ_API_KEY     → llama-3.3-70b-versatile (free, high rate limits)
 *   4. GROQ_API_KEY_2   → llama-3.3-70b-versatile (second Groq key, extra headroom)
 *
 * All server-side API routes import from this module.
 * Keys are read from process.env at call time — no module-level caching.
 *
 * @module aiProvider
 */

const GEMINI_MODEL = 'gemini-2.0-flash';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

/** Call Gemini REST API */
async function callGemini(apiKey, prompt, { temperature = 0.1, timeoutMs = 15000 } = {}) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message ?? `HTTP ${res.status}`;
    throw Object.assign(new Error(msg), { status: res.status, provider: 'gemini' });
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error('Gemini returned empty response');
  return text;
}

/** Call Groq via OpenAI-compatible API */
async function callGroq(apiKey, prompt, { temperature = 0.1, timeoutMs = 15000 } = {}) {
  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message ?? `HTTP ${res.status}`;
    throw Object.assign(new Error(msg), { status: res.status, provider: 'groq' });
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? '';
  if (!text) throw new Error('Groq returned empty response');
  return text;
}

/**
 * Checks if a Gemini error is "unrecoverable" — i.e., should trigger fallback.
 * Rate limit (429) and expired key (400 INVALID_ARGUMENT) both trigger fallback.
 */
function shouldFallback(err) {
  return err.status === 429 || err.status === 400 || err.status === 403;
}

/**
 * Main exported function.
 * Reads keys from process.env and tries providers in order.
 *
 * @param {string} prompt  - The full prompt to send
 * @param {object} opts    - { temperature, timeoutMs }
 * @returns {Promise<string>} - Raw text response
 */
export async function generateText(prompt, opts = {}) {
  const keys = {
    gemini1: process.env.GEMINI_API_KEY,
    gemini2: process.env.GEMINI_API_KEY_2,
    groq:    process.env.GROQ_API_KEY,
    groq2:   process.env.GROQ_API_KEY_2,
  };

  const errors = [];

  // 1. Try primary Gemini key
  if (keys.gemini1 && keys.gemini1 !== 'your_gemini_api_key_here') {
    try {
      const text = await callGemini(keys.gemini1, prompt, opts);
      console.log('[ai] Provider: gemini-primary');
      return text;
    } catch (err) {
      console.warn(`[ai] Gemini primary failed: ${err.message}`);
      errors.push(err);
      if (!shouldFallback(err)) throw err; // Network / timeout — don't mask it
    }
  }

  // 2. Try backup Gemini key
  if (keys.gemini2) {
    try {
      const text = await callGemini(keys.gemini2, prompt, opts);
      console.log('[ai] Provider: gemini-backup');
      return text;
    } catch (err) {
      console.warn(`[ai] Gemini backup failed: ${err.message}`);
      errors.push(err);
    }
  }

  // 3. Try Groq primary
  if (keys.groq) {
    try {
      const text = await callGroq(keys.groq, prompt, opts);
      console.log('[ai] Provider: groq-primary');
      return text;
    } catch (err) {
      console.warn(`[ai] Groq primary failed: ${err.message}`);
      errors.push(err);
    }
  }

  // 4. Try Groq backup
  if (keys.groq2) {
    try {
      const text = await callGroq(keys.groq2, prompt, opts);
      console.log('[ai] Provider: groq-backup');
      return text;
    } catch (err) {
      console.warn(`[ai] Groq backup failed: ${err.message}`);
      errors.push(err);
    }
  }

  // All providers failed
  const summary = errors.map(e => `[${e.provider ?? '?'}] ${e.message}`).join(' | ');
  throw new Error(`All AI providers failed: ${summary}`);
}

/**
 * Convenience: extract the first JSON object from a text response.
 * Handles markdown code fences that some models add.
 */
export function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in AI response');
  return JSON.parse(match[0]);
}

/**
 * Call Gemini with conversation history (for chat — multi-turn).
 * Falls back to single-turn Groq if Gemini fails.
 */
export async function generateChat({ systemInstruction, contents, locale = 'en' }, opts = {}) {
  const keys = {
    gemini1: process.env.GEMINI_API_KEY,
    gemini2: process.env.GEMINI_API_KEY_2,
    groq:    process.env.GROQ_API_KEY,
    groq2:   process.env.GROQ_API_KEY_2,
  };

  const timeoutMs = opts.timeoutMs ?? 10000;
  const temperature = opts.temperature ?? 0.2;

  // Build Groq messages from Gemini-format contents + system instruction
  function toGroqMessages() {
    const msgs = [];
    if (systemInstruction) msgs.push({ role: 'system', content: systemInstruction });
    for (const c of contents) {
      msgs.push({ role: c.role === 'model' ? 'assistant' : 'user', content: c.parts[0]?.text ?? '' });
    }
    return msgs;
  }

  // Try Gemini (supports multi-turn natively)
  for (const [label, key] of [['gemini-primary', keys.gemini1], ['gemini-backup', keys.gemini2]]) {
    if (!key || key === 'your_gemini_api_key_here') continue;
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(timeoutMs),
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: { maxOutputTokens: 1000, temperature, topP: 0.8, topK: 40 },
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw Object.assign(new Error(err?.error?.message ?? `HTTP ${res.status}`), { status: res.status });
      }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
      if (!text) throw new Error('Empty response');
      console.log(`[ai] Chat provider: ${label}`);
      return text;
    } catch (err) {
      console.warn(`[ai] Chat ${label} failed: ${err.message}`);
      if (!shouldFallback(err)) throw err;
    }
  }

  // Groq primary fallback for chat
  if (keys.groq) {
    try {
      const res = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keys.groq}` },
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify({ model: GROQ_MODEL, messages: toGroqMessages(), temperature }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Groq chat failed: ${err?.error?.message ?? res.status}`);
      }
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim() ?? '';
      console.log('[ai] Chat provider: groq-primary');
      return text;
    } catch (err) {
      console.warn(`[ai] Groq primary chat failed: ${err.message}`);
    }
  }

  // Groq backup fallback for chat
  if (keys.groq2) {
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keys.groq2}` },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({ model: GROQ_MODEL, messages: toGroqMessages(), temperature }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Groq backup chat failed: ${err?.error?.message ?? res.status}`);
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim() ?? '';
    console.log('[ai] Chat provider: groq-backup');
    return text;
  }

  throw new Error('All AI providers failed for chat');
}
