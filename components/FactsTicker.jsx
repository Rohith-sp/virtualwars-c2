'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import facts from '@/data/facts.json';

const INTERVAL_MS = 6000;

export default function FactsTicker() {
  const t = useTranslations('common');
  const indexRef = useRef(0);
  const fadeTimerRef = useRef(null);
  const [fact, setFact] = useState(facts[0]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      fadeTimerRef.current = setTimeout(() => {
        indexRef.current = (indexRef.current + 1) % facts.length;
        setFact(facts[indexRef.current]);
        setVisible(true);
      }, 300);
    }, INTERVAL_MS);
    return () => {
      clearInterval(timer);
      clearTimeout(fadeTimerRef.current);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1.25rem',
        background: 'var(--accent-blue-light)',
        borderLeft: '3px solid var(--accent-blue)',
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
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        <strong style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{t('didYouKnow')}</strong>
        {fact}
      </p>
    </div>
  );
}
