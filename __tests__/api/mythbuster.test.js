/**
 * @jest-environment node
 */

jest.mock('@/lib/aiProvider', () => ({
  generateText: jest.fn(),
  extractJSON: jest.requireActual('@/lib/aiProvider').extractJSON,
}));

import { generateText } from '@/lib/aiProvider';
import { POST } from '@/app/api/mythbuster/route';

const VALID_RESULT = {
  verdict: 'FALSE',
  verdictEmoji: '❌',
  explanation: 'Mobile phones cannot be used to cast votes in India.',
  officialSource: 'Representation of the People Act, 1951',
  tip: 'Always carry your EPIC card to the polling booth.',
};

function makeRequest(body) {
  return new Request('http://localhost/api/mythbuster', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/mythbuster — input validation', () => {
  it('returns 400 when claim is missing', async () => {
    const req = makeRequest({ locale: 'en' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when claim is too short (< 5 chars)', async () => {
    const req = makeRequest({ claim: 'hi' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when claim is not a string', async () => {
    const req = makeRequest({ claim: 12345 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = new Request('http://localhost/api/mythbuster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid}',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/mythbuster — successful fact-check', () => {
  beforeEach(() => {
    generateText.mockResolvedValue(JSON.stringify(VALID_RESULT));
  });

  afterEach(() => jest.clearAllMocks());

  it('returns 200 with result object', async () => {
    const req = makeRequest({ claim: 'You can vote using your mobile phone', locale: 'en' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.result).toBeDefined();
  });

  it('result contains verdict field', async () => {
    const req = makeRequest({ claim: 'You can vote using your mobile phone' });
    const res = await POST(req);
    const json = await res.json();
    expect(json.result.verdict).toBeTruthy();
    expect(['TRUE', 'FALSE', 'PARTIALLY TRUE', 'MISLEADING', 'UNVERIFIABLE'])
      .toContain(json.result.verdict);
  });

  it('result contains verdictEmoji', async () => {
    const req = makeRequest({ claim: 'NOTA removes the winning candidate from election' });
    const res = await POST(req);
    const json = await res.json();
    expect(json.result.verdictEmoji).toBeTruthy();
  });

  it('result contains explanation', async () => {
    const req = makeRequest({ claim: 'I need an Aadhaar card to vote in India' });
    const res = await POST(req);
    const json = await res.json();
    expect(typeof json.result.explanation).toBe('string');
    expect(json.result.explanation.length).toBeGreaterThan(0);
  });

  it('result contains officialSource', async () => {
    const req = makeRequest({ claim: 'EVM machines are rigged to change votes' });
    const res = await POST(req);
    const json = await res.json();
    expect(json.result.officialSource).toBeTruthy();
  });

  it('result contains tip for the voter', async () => {
    const req = makeRequest({ claim: 'Proxy voting is allowed in Indian elections' });
    const res = await POST(req);
    const json = await res.json();
    expect(json.result.tip).toBeTruthy();
  });

  it('trims whitespace from claim before processing', async () => {
    const req = makeRequest({ claim: '  Can I vote at any booth in India?  ' });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('works with Hindi locale', async () => {
    const req = makeRequest({ claim: 'क्या मैं मोबाइल फोन से वोट कर सकता हूं?', locale: 'hi' });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});

describe('POST /api/mythbuster — AI failure handling', () => {
  it('returns 502 when all AI providers fail', async () => {
    generateText.mockRejectedValue(new Error('All AI providers failed'));
    const req = makeRequest({ claim: 'Is it true EVM machines have been hacked?', locale: 'en' });
    const res = await POST(req);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it('returns 504 on request timeout', async () => {
    const err = new Error('AbortError');
    err.name = 'AbortError';
    generateText.mockRejectedValue(err);
    const req = makeRequest({ claim: 'Can I vote without my Voter ID?' });
    const res = await POST(req);
    expect(res.status).toBe(504);
  });
});
