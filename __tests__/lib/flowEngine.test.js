/**
 * @jest-environment node
 */
import { buildIndex, getNode, getOptions, getNextId, isTerminal } from '@/lib/flowEngine';

const MOCK_NODES = [
  {
    id: 'start',
    type: 'question',
    text: 'Are you registered to vote?',
    options: [
      { label: 'Yes', nextId: 'registered' },
      { label: 'No', nextId: 'register_now' },
    ],
  },
  {
    id: 'registered',
    type: 'question',
    text: 'Do you know your polling booth?',
    options: [
      { label: 'Yes', nextId: 'done' },
      { label: 'No', nextId: 'find_booth' },
    ],
  },
  { id: 'register_now', type: 'info', text: 'Visit voters.eci.gov.in to register.' },
  { id: 'done', type: 'terminal', text: 'You are all set to vote!' },
  { id: 'find_booth', type: 'terminal', text: 'Use the Booth Locator tool above.' },
];

describe('flowEngine — buildIndex', () => {
  it('builds a map keyed by node id', () => {
    const index = buildIndex(MOCK_NODES);
    expect(Object.keys(index)).toHaveLength(MOCK_NODES.length);
    expect(index['start']).toEqual(MOCK_NODES[0]);
  });

  it('returns an empty object for empty array', () => {
    expect(buildIndex([])).toEqual({});
  });

  it('last duplicate id wins (deterministic)', () => {
    const dupes = [
      { id: 'a', value: 1 },
      { id: 'a', value: 2 },
    ];
    expect(buildIndex(dupes)['a'].value).toBe(2);
  });
});

describe('flowEngine — getNode', () => {
  const index = buildIndex(MOCK_NODES);

  it('returns the correct node for a known id', () => {
    const node = getNode(index, 'start');
    expect(node.type).toBe('question');
    expect(node.text).toMatch(/registered/i);
  });

  it('returns null for unknown id', () => {
    expect(getNode(index, 'nonexistent')).toBeNull();
  });

  it('returns null for empty string id', () => {
    expect(getNode(index, '')).toBeNull();
  });
});

describe('flowEngine — getOptions', () => {
  const index = buildIndex(MOCK_NODES);

  it('returns options array for question nodes', () => {
    const options = getOptions(getNode(index, 'start'));
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveProperty('label', 'Yes');
    expect(options[0]).toHaveProperty('nextId', 'registered');
  });

  it('returns empty array for non-question nodes', () => {
    expect(getOptions(getNode(index, 'register_now'))).toEqual([]);
  });

  it('returns empty array for terminal nodes', () => {
    expect(getOptions(getNode(index, 'done'))).toEqual([]);
  });

  it('returns empty array for null node', () => {
    expect(getOptions(null)).toEqual([]);
  });

  it('returns empty array for node with no options field', () => {
    expect(getOptions({ type: 'question' })).toEqual([]);
  });
});

describe('flowEngine — getNextId', () => {
  const index = buildIndex(MOCK_NODES);

  it('returns correct nextId for matching option label', () => {
    const node = getNode(index, 'start');
    expect(getNextId(node, 'Yes')).toBe('registered');
    expect(getNextId(node, 'No')).toBe('register_now');
  });

  it('returns null for unknown option label', () => {
    const node = getNode(index, 'start');
    expect(getNextId(node, 'Maybe')).toBeNull();
  });

  it('returns null for null node', () => {
    expect(getNextId(null, 'Yes')).toBeNull();
  });

  it('is case-sensitive for option labels', () => {
    const node = getNode(index, 'start');
    expect(getNextId(node, 'yes')).toBeNull();
  });
});

describe('flowEngine — isTerminal', () => {
  const index = buildIndex(MOCK_NODES);

  it('returns true for terminal nodes', () => {
    expect(isTerminal(getNode(index, 'done'))).toBe(true);
    expect(isTerminal(getNode(index, 'find_booth'))).toBe(true);
  });

  it('returns false for question nodes', () => {
    expect(isTerminal(getNode(index, 'start'))).toBe(false);
  });

  it('returns false for info nodes', () => {
    expect(isTerminal(getNode(index, 'register_now'))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isTerminal(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isTerminal(undefined)).toBe(false);
  });
});
