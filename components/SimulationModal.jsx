'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import ConfettiOverlay from '@/components/ConfettiOverlay';
import { trackEvent, GA_EVENTS } from '@/lib/analytics';

const CANDIDATES = [
  { id: 'c1', name: 'Amara Singh',   party: 'Progressive Party',   symbol: '🌺' },
  { id: 'c2', name: 'Ravi Kumar',    party: 'Development Alliance', symbol: '⚙️' },
  { id: 'c3', name: 'Priya Patel',   party: 'Green Future',         symbol: '🌿' },
  { id: 'c4', name: 'Deepak Sharma', party: 'United Front',         symbol: '✊' },
  { id: 'c5', name: 'Meera Nair',    party: 'Citizens’ Choice',     symbol: '🕊️' },
  { id: 'nota', name: 'NOTA',        party: 'None Of The Above',    symbol: '❌' },
];

function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const SELECTORS = 'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(ref.current.querySelectorAll(SELECTORS));

    getFocusable()[0]?.focus();

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active, ref]);
}

export default function SimulationModal({ isOpen, onClose }) {
  const t = useTranslations('simulation');
  const [phase, setPhase] = useState('selecting'); // selecting | voted
  const [selected, setSelected] = useState(null);
  const modalRef = useRef(null);

  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    if (isOpen) {
      trackEvent(GA_EVENTS.SIMULATION_STARTED);
      setPhase('selecting');
      setSelected(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  const candidate = CANDIDATES.find((c) => c.id === selected);

  return (
    <>
      {phase === 'voted' && <ConfettiOverlay />}

      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(26,26,46,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
        }}
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Vote simulation"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
          width: 'min(520px, 95vw)',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{t('title')}</h2>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close simulation modal"
            style={{ padding: 'var(--space-2)' }}
          >
            ✕
          </button>
        </div>

        {phase === 'selecting' && (
          <>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {t('instruction')}
            </p>
            <div role="group" aria-label="Candidate list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {CANDIDATES.map((c) => {
                const isSelected = selected === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    aria-label={`Vote for ${c.name}, ${c.party}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-4)',
                      padding: 'var(--space-3) var(--space-4)',
                      background: isSelected ? 'var(--accent-saffron-light)' : 'var(--bg-subtle)',
                      border: `2px solid ${isSelected ? 'var(--accent-saffron)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <div style={{ 
                      width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', 
                      background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', border: '1px solid var(--border)' 
                    }}>
                      {c.symbol}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem', fontFamily: 'var(--font-body)' }}>
                        {t(`candidates.${c.id}.name`)}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {t(`candidates.${c.id}.party`)}
                      </div>
                    </div>
                    {/* Fake EVM blue button indicator */}
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: isSelected ? 'var(--accent-blue)' : 'var(--border)',
                      boxShadow: isSelected ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'none'
                    }} />
                  </button>
                );
              })}
            </div>
            
            <button
              className="btn btn-primary"
              disabled={!selected}
              onClick={() => setPhase('voted')}
              style={{
                width: '100%',
                marginTop: 'var(--space-2)',
                opacity: selected ? 1 : 0.4,
              }}
            >
              {t('confirm')} ✓
            </button>
          </>
        )}

        {phase === 'voted' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: 'var(--space-6) 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', 
                background: 'rgba(42,122,75,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-green)', fontSize: '3rem'
              }}>
                ✓
              </div>
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '2rem', marginBottom: 'var(--space-2)' }}>
                {t('successTitle')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {t('successMessage')}
              </p>
            </div>
            <div
              style={{
                display: 'inline-block',
                padding: 'var(--space-4)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
              }}
            >
              You voted for: <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '1.1rem', marginTop: 'var(--space-1)' }}>{candidate?.symbol} {t(`candidates.${candidate?.id}.name`)}</strong>
            </div>
            <button className="btn btn-primary" onClick={onClose} aria-label="Close simulation and return to guide" style={{ width: '100%' }}>
              Back to Guide
            </button>
          </div>
        )}
      </div>
    </>
  );
}
