'use client';

import { useState, useEffect, useRef } from 'react';
import facts from '@/data/facts.json';

const INTERVAL_MS = 6000;

export default function FactsTicker() {
  const indexRef = useRef(0);
  const [fact, setFact] = useState(facts[0]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        indexRef.current = (indexRef.current + 1) % facts.length;
        setFact(facts[indexRef.current]);
        setVisible(true);
      }, 300);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        background: 'var(--color-primary-dim)',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-md)',
        maxWidth: '700px',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(8px)',
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
      <p
        style={{
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        <strong style={{ color: 'var(--color-primary)' }}>Did you know? </strong>
        {fact}
      </p>
    </div>
  );
}
