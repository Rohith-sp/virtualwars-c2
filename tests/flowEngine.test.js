import flows from '../data/flows.json';
import {
  buildIndex,
  getNode,
  getOptions,
  isTerminal,
  getNextId,
} from '../lib/flowEngine.js';

// Build the index once — shared across all tests in this file
const INDEX = buildIndex(flows);

describe('flowEngine', () => {
  // ── Test 1 ─────────────────────────────────────────────────────────────
  test('getNode returns the correct node for a valid id', () => {
    const node = getNode(INDEX, 'root');
    expect(node).not.toBeNull();
    expect(node.id).toBe('root');
    expect(node.type).toBe('question');
    expect(typeof node.text).toBe('string');
  });

  // ── Test 2 ─────────────────────────────────────────────────────────────
  test('getNode returns null gracefully for an invalid id', () => {
    expect(getNode(INDEX, 'nonexistent_xyz_999')).toBeNull();
    expect(getNode(INDEX, '')).toBeNull();
    expect(getNode(INDEX, undefined)).toBeNull();
  });

  // ── Test 3 ─────────────────────────────────────────────────────────────
  test('getOptions returns a non-empty array for a question node', () => {
    const rootNode = getNode(INDEX, 'root');
    const options = getOptions(rootNode);
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);
    // Each option must have label and nextId
    options.forEach((opt) => {
      expect(typeof opt.label).toBe('string');
      expect(typeof opt.nextId).toBe('string');
    });
  });

  // ── Test 4 ─────────────────────────────────────────────────────────────
  test('getOptions returns an empty array for a terminal node', () => {
    const terminalNode = getNode(INDEX, 'form6_online');
    expect(terminalNode).not.toBeNull();
    expect(terminalNode.type).toBe('terminal');
    const options = getOptions(terminalNode);
    expect(options).toEqual([]);
  });

  // ── Test 5 ─────────────────────────────────────────────────────────────
  test('full path traversal: root → form6_eligibility → form6_documents → form6_online is terminal', () => {
    // Step 1: root is a question
    const root = getNode(INDEX, 'root');
    expect(root.type).toBe('question');

    // Step 2: root has an option pointing to form6_eligibility
    const toEligibility = root.options.find((o) => o.nextId === 'form6_eligibility');
    expect(toEligibility).toBeDefined();

    // Step 3: form6_eligibility is a question with an option to form6_documents
    const eligibility = getNode(INDEX, toEligibility.nextId);
    expect(eligibility.type).toBe('question');
    const toDocs = eligibility.options.find((o) => o.nextId === 'form6_documents');
    expect(toDocs).toBeDefined();

    // Step 4: form6_documents is an info node with an option to form6_online
    const docs = getNode(INDEX, toDocs.nextId);
    expect(docs.type).toBe('info');
    const toOnline = docs.options.find((o) => o.nextId === 'form6_online');
    expect(toOnline).toBeDefined();

    // Step 5: form6_online is a terminal node
    const terminal = getNode(INDEX, toOnline.nextId);
    expect(isTerminal(terminal)).toBe(true);
    expect(getOptions(terminal)).toEqual([]);

    // Bonus: getNextId helper works along the path
    expect(getNextId(root, toEligibility.label)).toBe('form6_eligibility');
  });
});
