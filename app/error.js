'use client';

import { useEffect } from 'react';

/**
 * Next.js App Router built-in page-level error boundary.
 * Handles server component errors and unhandled promise rejections at the page level.
 * Client component sub-tree errors are handled separately by ErrorBoundary.jsx.
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    // Report to Sentry — only the sanitised error object, no raw user input.
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '1.1rem', color: 'var(--text-primary, #f0f4ff)' }}>
        Something went wrong loading this section.
      </p>
      <p style={{ fontSize: '0.875rem', opacity: 0.6, color: 'var(--text-secondary, #a8b8d8)' }}>
        {error?.message ?? 'Unknown error'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '0.5rem 1.25rem',
          cursor: 'pointer',
          background: 'var(--color-primary, #ff6b35)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
        }}
      >
        Try again
      </button>
    </div>
  );
}
