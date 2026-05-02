/**
 * @jest-environment node
 */
import { extractJSON } from '@/lib/aiProvider';

describe('aiProvider — extractJSON', () => {
  it('parses a clean JSON object from plain text', () => {
    const text = '{"verdict":"TRUE","explanation":"It is correct."}';
    const result = extractJSON(text);
    expect(result.verdict).toBe('TRUE');
    expect(result.explanation).toBe('It is correct.');
  });

  it('extracts JSON embedded in markdown code fence', () => {
    const text = '```json\n{"verdict":"FALSE","explanation":"Not valid."}\n```';
    const result = extractJSON(text);
    expect(result.verdict).toBe('FALSE');
  });

  it('extracts JSON preceded by explanation text', () => {
    const text = 'Here is the comparison:\n{"topic":"Education","party1":{"name":"BJP"}}';
    const result = extractJSON(text);
    expect(result.topic).toBe('Education');
    expect(result.party1.name).toBe('BJP');
  });

  it('extracts nested JSON correctly', () => {
    const text = `{
      "comparison": {
        "party1": { "name": "BJP", "keyPromises": ["Promise A", "Promise B"] },
        "party2": { "name": "INC", "keyPromises": ["Promise C"] },
        "verdict": "Both parties focus on education."
      }
    }`;
    const result = extractJSON(text);
    expect(result.comparison.party1.name).toBe('BJP');
    expect(result.comparison.party1.keyPromises).toHaveLength(2);
  });

  it('throws when no JSON object is present', () => {
    expect(() => extractJSON('This is just plain text with no JSON')).toThrow();
  });

  it('throws when JSON is malformed', () => {
    expect(() => extractJSON('{invalid json: yes}')).toThrow();
  });

  it('handles JSON with Unicode (Indian language content)', () => {
    const text = '{"verdict":"TRUE","explanation":"यह सही है।"}';
    const result = extractJSON(text);
    expect(result.explanation).toBe('यह सही है।');
  });

  it('extracts JSON when surrounded by text on both sides', () => {
    const text = 'Result: {"key":"value"} end of response.';
    const result = extractJSON(text);
    expect(result.key).toBe('value');
  });

  it('handles empty object', () => {
    const result = extractJSON('{}');
    expect(result).toEqual({});
  });

  it('parses myth-buster response shape', () => {
    const text = JSON.stringify({
      verdict: 'FALSE',
      verdictEmoji: '❌',
      explanation: 'Mobile phones cannot be used to cast votes in India.',
      officialSource: 'Representation of the People Act, 1951',
      tip: 'Always carry your EPIC card to the polling booth.',
    });
    const result = extractJSON(text);
    expect(result.verdict).toBe('FALSE');
    expect(result.verdictEmoji).toBe('❌');
    expect(result.officialSource).toBeTruthy();
    expect(result.tip).toBeTruthy();
  });

  it('parses manifesto comparator response shape', () => {
    const text = JSON.stringify({
      topic: 'Healthcare',
      party1: { name: 'BJP', keyPromises: ['Free health cards'], summary: 'Focus on hospitals.' },
      party2: { name: 'INC', keyPromises: ['Universal coverage'], summary: 'Focus on insurance.' },
      verdict: 'BJP focuses on infrastructure; INC focuses on insurance coverage.',
    });
    const result = extractJSON(text);
    expect(result.topic).toBe('Healthcare');
    expect(result.party1.keyPromises).toHaveLength(1);
    expect(result.verdict).toContain('BJP');
  });
});
