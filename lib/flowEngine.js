// lib/flowEngine.js
// Pure functions only — no side effects, no imports, no state.
// Loaded once by FlowChat; index built with useMemo(() => buildIndex(flows), []).

/**
 * Build an O(1) lookup map from a flat nodes array.
 * @param {Array<{id: string}>} nodes
 * @returns {Record<string, object>}
 */
export const buildIndex = (nodes) =>
  Object.fromEntries(nodes.map((n) => [n.id, n]));

/**
 * Retrieve a node by id. Returns null for unknown ids.
 * @param {Record<string, object>} index
 * @param {string} id
 * @returns {object|null}
 */
export const getNode = (index, id) => index[id] ?? null;

/**
 * Return option array for question nodes; empty array for all other types.
 * @param {object|null} node
 * @returns {Array<{label: string, nextId: string}>}
 */
export const getOptions = (node) =>
  node?.type === 'question' && Array.isArray(node.options) ? node.options : [];

/**
 * Find the nextId for a chosen option label.
 * @param {object|null} node
 * @param {string} optionLabel
 * @returns {string|null}
 */
export const getNextId = (node, optionLabel) =>
  getOptions(node).find((o) => o.label === optionLabel)?.nextId ?? null;

/**
 * Check whether a node is a terminal (leaf) node.
 * @param {object|null} node
 * @returns {boolean}
 */
export const isTerminal = (node) => node?.type === 'terminal';
