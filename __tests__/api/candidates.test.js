/**
 * @jest-environment node
 */

// Mock fetch globally so tests don't hit real Gemini API
global.fetch = jest.fn();

import { GET } from '@/app/api/candidates/route';

function makeRequest(constituency = '') {
  return new Request(
    `http://localhost/api/candidates${constituency ? `?constituency=${encodeURIComponent(constituency)}` : ''}`
  );
}

describe('GET /api/candidates — input validation', () => {
  it('returns 400 when constituency param is missing', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it('returns 400 when constituency is empty string', async () => {
    const req = new Request('http://localhost/api/candidates?constituency=');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/candidates — API key handling', () => {
  const originalGemini = process.env.GEMINI_API_KEY;
  const originalGemini2 = process.env.GEMINI_API_KEY_2;

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalGemini;
    process.env.GEMINI_API_KEY_2 = originalGemini2;
    jest.clearAllMocks();
  });

  it('returns 500 when no API keys are configured', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY_2;
    const res = await GET(makeRequest('Mumbai North'));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });
});

describe('GET /api/candidates — successful response', () => {
  const MOCK_CANDIDATES = [
    {
      id: 'c1',
      name: 'Piyush Goyal',
      party: 'BJP',
      education: 'CA',
      assets: '₹119 Cr',
      criminalCases: 0,
      age: 59,
      profileUrl: 'https://en.wikipedia.org/wiki/Piyush_Goyal',
    },
  ];

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key';
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{ text: JSON.stringify(MOCK_CANDIDATES) }],
          },
        }],
      }),
    });
  });

  afterEach(() => jest.clearAllMocks());

  it('returns 200 with candidates when API succeeds', async () => {
    const res = await GET(makeRequest('Mumbai North'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('candidates');
  });

  it('response candidates is an array', async () => {
    const res = await GET(makeRequest('New Delhi'));
    const json = await res.json();
    expect(Array.isArray(json.candidates)).toBe(true);
  });
});

describe('GET /api/candidates — error handling', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key';
  });

  afterEach(() => jest.clearAllMocks());

  it('returns 502 when API call fails', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 500 });
    const res = await GET(makeRequest('Chennai Central'));
    expect(res.status).toBe(502);
  });
});
