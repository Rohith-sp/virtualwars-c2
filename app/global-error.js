'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif',
          background: '#0f0f1a',
          color: '#fff',
          textAlign: 'center',
          padding: '2rem',
          gap: '1.5rem',
        }}
      >
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ color: '#aaa', maxWidth: '400px', lineHeight: 1.6 }}>
          A critical error has occurred. Our team has been notified. Please try refreshing the page.
        </p>
        <button
          onClick={reset}
          style={{
            background: '#FF9933',
            color: '#fff',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
