// lib/analytics.js
// Thin wrapper so components never reference window.gtag directly.
// All valid event names are documented here as UPPER_SNAKE constants.

/** All tracked GA4 custom event names. Components must use these constants. */
export const GA_EVENTS = {
  FLOW_STARTED: 'flow_started',
  FLOW_COMPLETED: 'flow_completed',
  AI_QUESTION_ASKED: 'ai_question_asked',
  SIMULATION_STARTED: 'simulation_started',
};

/**
 * Send a GA4 custom event.
 * Safe to import in Server Components — no-ops if window is undefined.
 * @param {string} eventName - one of GA_EVENTS values
 * @param {Record<string, string|number>} [params] - optional extra dimensions
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}
