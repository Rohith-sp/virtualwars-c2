'use client';

/**
 * FirebaseAnalyticsProvider
 *
 * Client component that initializes Firebase Analytics on mount.
 * Must be rendered inside a Client Component boundary.
 * Placed in the locale layout to cover all pages.
 */
import { useEffect } from 'react';
import { initFirebase, getFirebaseAnalytics } from '@/lib/firebase';

export default function FirebaseAnalyticsProvider() {
  useEffect(() => {
    // Initialize Firebase app and Analytics on first client render
    initFirebase();
    getFirebaseAnalytics().catch(() => {
      // Silent — analytics failure must never break the app
    });
  }, []);

  return null; // Renders nothing — pure side-effect component
}
