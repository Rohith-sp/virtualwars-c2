/**
 * lib/analytics.js
 *
 * Unified analytics layer — wraps both Google Analytics 4 (GA4) and
 * Firebase Analytics so components use a single import for event tracking.
 *
 * Usage:
 *   import { trackEvent, GA_EVENTS } from '@/lib/analytics';
 *   trackEvent(GA_EVENTS.AI_QUESTION_ASKED, { locale: 'hi' });
 */

/** All tracked GA4 / Firebase Analytics event names. Always use these constants. */
export const GA_EVENTS = {
  FLOW_STARTED: 'flow_started',
  FLOW_COMPLETED: 'flow_completed',
  AI_QUESTION_ASKED: 'ai_question_asked',
  MANIFESTO_COMPARED: 'manifesto_compared',
  MYTH_CHECKED: 'myth_checked',
  CANDIDATE_SEARCHED: 'candidate_searched',
  BOOTH_LOCATED: 'booth_located',
  SIMULATION_STARTED: 'simulation_started',
  SHARE_CARD_DOWNLOADED: 'share_card_downloaded',
  LANGUAGE_SWITCHED: 'language_switched',
};

/**
 * Send a custom event to Google Analytics 4 (via gtag).
 * Safe to call in any context — no-ops on the server or when gtag is absent.
 *
 * @param {string} eventName - Event name; use GA_EVENTS constants
 * @param {Record<string, string|number|boolean>} [params] - Optional event parameters
 * @returns {void}
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

/**
 * Send an event to BOTH GA4 and Firebase Analytics.
 * Use this for the most important user interactions.
 *
 * @param {string} eventName - Event name; use GA_EVENTS constants
 * @param {Record<string, string|number|boolean>} [params] - Optional event parameters
 * @returns {Promise<void>}
 */
export async function trackEventAll(eventName, params = {}) {
  trackEvent(eventName, params);
  // Firebase Analytics (dynamic import to avoid SSR bundle bloat)
  try {
    const { logFirebaseEvent } = await import('./firebase');
    await logFirebaseEvent(eventName, params);
  } catch {
    // Silent — Firebase is optional
  }
}
