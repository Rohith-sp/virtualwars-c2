'use client';

import { useState } from 'react';

export default function FormCard({ form }) {
  const [open, setOpen] = useState(false);

  return (
    <article
      className="card-glass"
      style={{
        borderTop: `3px solid ${form.accentColor}`,
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        animation: 'fadeSlideUp var(--dur-slow) var(--ease) both',
      }}
      aria-label={`${form.number}: ${form.title}`}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: '2rem' }} aria-hidden="true">{form.emoji}</span>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: form.accentColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {form.number}
          </div>
          <h3 style={{ color: 'var(--text-primary)', marginTop: '2px' }}>{form.title}</h3>
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          ⏱ {form.processingDays}
        </span>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-primary)' }}>Eligible if: </strong>
        {form.eligibility}
      </p>

      {/* Documents */}
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
          Documents Required
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {form.documents.map((doc, i) => (
            <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
              <span style={{ color: form.accentColor, flexShrink: 0 }}>•</span>
              {doc}
            </li>
          ))}
        </ul>
      </div>

      {/* Steps accordion */}
      <div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={`steps-${form.id}`}
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <span>Step-by-step guide</span>
          <span aria-hidden="true" style={{ transition: 'transform var(--dur-fast) var(--ease)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
        </button>

        {open && (
          <ol
            id={`steps-${form.id}`}
            style={{
              marginTop: 'var(--space-3)',
              paddingLeft: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            {form.steps.map((step, i) => (
              <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {step}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* CTA */}
      <a
        href={form.onlineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary btn-sm"
        aria-label={`Apply for ${form.number} online at ECI portal`}
      >
        Apply Online →
      </a>
    </article>
  );
}
