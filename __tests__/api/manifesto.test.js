/**
 * @jest-environment node
 */

// Mock aiProvider so tests don't hit real API
jest.mock('@/lib/aiProvider', () => ({
  generateText: jest.fn(),
  extractJSON: jest.requireActual('@/lib/aiProvider').extractJSON,
}));

import { generateText } from '@/lib/aiProvider';
import { POST } from '@/app/api/manifesto/route';

const VALID_COMPARISON = {
  topic: 'Education',
  party1: { name: 'BJP', keyPromises: ['Free textbooks'], summary: 'Focus on literacy.' },
  party2: { name: 'INC', keyPromises: ['Mid-day meals'], summary: 'Focus on nutrition.' },
  verdict: 'Both parties prioritize primary education with different approaches.',
};

function makeRequest(body) {
  return new Request('http://localhost/api/manifesto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/manifesto — input validation', () => {
  it('returns 400 when party1 is missing', async () => {
    const req = makeRequest({ party2: 'INC', topic: 'Education' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it('returns 400 when party2 is missing', async () => {
    const req = makeRequest({ party1: 'BJP', topic: 'Education' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when topic is missing', async () => {
    const req = makeRequest({ party1: 'BJP', party2: 'INC' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid JSON body', async () => {
    const req = new Request('http://localhost/api/manifesto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-valid-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/manifesto — successful response', () => {
  beforeEach(() => {
    generateText.mockResolvedValue(JSON.stringify(VALID_COMPARISON));
  });

  afterEach(() => jest.clearAllMocks());

  it('returns 200 with comparison object', async () => {
    const req = makeRequest({ party1: 'BJP', party2: 'INC', topic: 'Education', locale: 'en' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.comparison).toBeDefined();
    expect(json.comparison.topic).toBe('Education');
  });

  it('comparison has party1 and party2 objects', async () => {
    const req = makeRequest({ party1: 'BJP', party2: 'INC', topic: 'Healthcare' });
    const res = await POST(req);
    const json = await res.json();
    expect(json.comparison.party1).toHaveProperty('name');
    expect(json.comparison.party2).toHaveProperty('name');
    expect(Array.isArray(json.comparison.party1.keyPromises)).toBe(true);
  });

  it('comparison has a verdict string', async () => {
    const req = makeRequest({ party1: 'BJP', party2: 'INC', topic: 'Economy' });
    const res = await POST(req);
    const json = await res.json();
    expect(typeof json.comparison.verdict).toBe('string');
    expect(json.comparison.verdict.length).toBeGreaterThan(0);
  });

  it('defaults locale to en when not provided', async () => {
    const req = makeRequest({ party1: 'BJP', party2: 'INC', topic: 'Jobs' });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('accepts valid locale codes', async () => {
    for (const locale of ['hi', 'bn', 'te', 'ta']) {
      const req = makeRequest({ party1: 'BJP', party2: 'INC', topic: 'Education', locale });
      const res = await POST(req);
      expect(res.status).toBe(200);
    }
  });
});

describe('POST /api/manifesto — AI failure handling', () => {
  it('returns 502 when all AI providers fail', async () => {
    generateText.mockRejectedValue(new Error('All AI providers failed'));
    const req = makeRequest({ party1: 'BJP', party2: 'INC', topic: 'Education' });
    const res = await POST(req);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it('returns 504 on timeout', async () => {
    const timeoutErr = new Error('Timeout');
    timeoutErr.name = 'TimeoutError';
    generateText.mockRejectedValue(timeoutErr);
    const req = makeRequest({ party1: 'BJP', party2: 'INC', topic: 'Education' });
    const res = await POST(req);
    expect(res.status).toBe(504);
  });
});
