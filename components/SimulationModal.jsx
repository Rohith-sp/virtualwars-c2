'use client';

import { useState, useEffect, useRef } from 'react';
import ConfettiOverlay from '@/components/ConfettiOverlay';
import { trackEvent, GA_EVENTS } from '@/lib/analytics';

const CANDIDATES = [
  { id: 'c1', name: 'Amara Singh',   party: 'Progressive Party',   symbol: '🌺' },
  { id: 'c2', name: 'Ravi Kumar',    party: 'Development Alliance', symbol: '⚙️' },
  { id: 'c3', name: 'Priya Patel',   party: 'Green Future',         symbol: '🌿' },
  { id: 'c4', name: 'Deepak Sharma', party: 'United Front',         symbol: '✊' },
  { id: 'c5', name: 'Meera Nair',    party: 'Citizens\u2019 Choice', symbol: '🕊️' },
  { id: 'nota', name: 'NOTA',        party: 'None Of The Above',    symbol: '❌' },
];

// ── Focus trap hook ─────────────────────────────────────────────────────────
function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const SELECTORS = 'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(ref.current.querySelectorAll(SELECTORS));

    // Focus first focusable element when opened
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

// ── Component ───────────────────────────────────────────────────────────────
export default function SimulationModal({ isOpen, onClose }) {
  const [phase, setPhase] = useState('selecting'); // selecting | confirming | voted
  const [selected, setSelected] = useState(null);
  const modalRef = useRef(null);

  useFocusTrap(modalRef, isOpen);

  // Fire GA event on first open
  useEffect(() => {
    if (isOpen) {
      trackEvent(GA_EVENTS.SIMULATION_STARTED);
      setPhase('selecting');
      setSelected(null);
    }
  }, [isOpen]);

  // Close on Escape
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

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
        }}
      />

      {/* Modal */}
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
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-float)',
          padding: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
        }}
      >
        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem' }}>🗳️ Practice Voting</h2>
          <button
            className="btn btn-outline btn-sm"
            onClick={onClose}
            aria-label="Close simulation modal"
          >
            ✕
          </button>
        </div>

        {/* Phase: selecting */}
        {phase === 'selecting' && (
          <>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              This is a safe practice simulation. Select a candidate to vote for:
            </p>
            <div role="group" aria-label="Candidate list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {CANDIDATES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelected(c.id); setPhase('confirming'); }}
                  aria-label={`Vote for ${c.name}, ${c.party}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    background: c.id === 'nota' ? 'rgba(239,68,68,0.06)' : 'var(--bg-surface-2)',
                    border: `1.5px solid ${c.id === 'nota' ? 'rgba(239,68,68,0.2)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'border-color var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease)',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = c.id === 'nota' ? 'rgba(239,68,68,0.2)' : 'var(--border-subtle)'; e.currentTarget.style.transform = ''; }}
                >
                  <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{c.symbol}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.party}</div>
                  </div>
                  <span aria-hidden="true" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>›</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Phase: confirming */}
        {phase === 'confirming' && candidate && (
          <>
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-8)',
                background: 'var(--bg-surface-2)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>{candidate.symbol}</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{candidate.name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>{candidate.party}</div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Are you sure you want to cast your vote for <strong style={{ color: 'var(--text-primary)' }}>{candidate.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setPhase('selecting')} aria-label="Go back and change your vote">
                ← Change
              </button>
              <button
                className="btn btn-primary animate-pulse-glow"
                style={{ flex: 1 }}
                onClick={() => setPhase('voted')}
                aria-label={`Confirm vote for ${candidate.name}`}
              >
                Confirm Vote ✓
              </button>
            </div>
          </>
        )}

        {/* Phase: voted */}
        {phase === 'voted' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{ fontSize: '4rem' }}>🎉</div>
            <div>
              <h3 style={{ color: 'var(--color-success)', fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>
                Your vote has been cast!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                In a real election your vote is anonymous and final. Thank you for participating in democracy!
              </p>
            </div>
            <div
              style={{
                display: 'inline-block',
                padding: 'var(--space-4)',
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}
            >
              You voted for: <strong style={{ color: 'var(--text-primary)' }}>{candidate?.symbol} {candidate?.name}</strong>
            </div>
            <button className="btn btn-primary" onClick={onClose} aria-label="Close simulation and return to guide">
              Back to Guide
            </button>
          </div>
        )}
      </div>
    </>
  );
}
