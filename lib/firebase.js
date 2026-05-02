/**
 * lib/firebase.js
 *
 * Firebase client SDK — initialized once (singleton pattern).
 * Used for: Firebase Analytics (Google Services integration).
 * Safe to import in Client Components only (guards against SSR).
 *
 * Firebase project: voteguide-india-320d6
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';

/** @type {import('firebase/app').FirebaseApp} */
let app;

/** @type {import('firebase/analytics').Analytics | null} */
let analytics = null;

const firebaseConfig = {
  apiKey: 'AIzaSyCjqHG93mRDMEv3CMSQj7oeDZD8l1Ocywc',
  authDomain: 'voteguide-india-320d6.firebaseapp.com',
  projectId: 'voteguide-india-320d6',
  storageBucket: 'voteguide-india-320d6.firebasestorage.app',
  messagingSenderId: '520127185212',
  appId: '1:520127185212:web:92db38481cf56f05669e39',
  measurementId: 'G-4MY139Y74N',
};

/**
 * Initialize Firebase app (singleton — safe to call multiple times).
 * @returns {import('firebase/app').FirebaseApp}
 */
export function initFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  return app;
}

/**
 * Get Firebase Analytics instance.
 * Returns null in SSR context or unsupported environments.
 * @returns {Promise<import('firebase/analytics').Analytics | null>}
 */
export async function getFirebaseAnalytics() {
  if (typeof window === 'undefined') return null;
  if (analytics) return analytics;

  try {
    const supported = await isSupported();
    if (!supported) return null;
    const firebaseApp = initFirebase();
    analytics = getAnalytics(firebaseApp);
    return analytics;
  } catch (e) {
    console.warn('[Firebase] Analytics init failed:', e.message);
    return null;
  }
}

/**
 * Log a Firebase Analytics event.
 * No-ops gracefully if Analytics is not available.
 *
 * @param {string} eventName - Firebase Analytics event name
 * @param {Record<string, string|number|boolean>} [params] - Event parameters
 * @returns {Promise<void>}
 */
export async function logFirebaseEvent(eventName, params = {}) {
  try {
    const analyticsInstance = await getFirebaseAnalytics();
    if (!analyticsInstance) return;
    logEvent(analyticsInstance, eventName, params);
  } catch (e) {
    // Silent fail — analytics must never break the app
  }
}

/**
 * Standard Firebase Analytics event names used in VoteGuide India.
 */
export const FB_EVENTS = {
  PAGE_VIEW: 'page_view',
  AI_CHAT_USED: 'ai_chat_used',
  MANIFESTO_COMPARED: 'manifesto_compared',
  MYTH_CHECKED: 'myth_checked',
  CANDIDATE_SEARCHED: 'candidate_searched',
  BOOTH_LOCATED: 'booth_located',
  SIMULATION_STARTED: 'simulation_started',
  SHARE_CARD_DOWNLOADED: 'share_card_downloaded',
  LANGUAGE_SWITCHED: 'language_switched',
};
