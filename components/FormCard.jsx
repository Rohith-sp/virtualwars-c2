'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function FormCard({ form }) {
  const t = useTranslations('forms');
  const [open, setOpen] = useState(false);

  // Remap specific accents if needed, or rely on form.accentColor if we updated forms.json.
  // Assuming form.accentColor might be old colors. We'll use Civic White generic colors or map them.
  const color = 'var(--accent-blue)';

  return (
    <article
      id={form.id}
      className="card"
      style={{
        borderTop: `4px solid ${color}`,
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        textAlign: 'left'
      }}
      aria-label={`${form.number}: ${form.title}`}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: '2rem' }} aria-hidden="true">{form.emoji}</span>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {form.number}
          </div>
          <h3 style={{ color: 'var(--text-primary)', marginTop: '2px' }}>{t(`data.${form.id}.title`)}</h3>
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          ⏱ {form.processingDays}
        </span>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-primary)' }}>{t('eligibleIf')} </strong>
        {t(`data.${form.id}.eligibility`)}
      </p>

      {/* Documents */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
          {t('documentsRequired')}
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {form.documents.map((doc, i) => (
            <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
              <span style={{ color, flexShrink: 0 }}>•</span>
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
          style={{ width: '100%', justifyContent: 'space-between', border: '1px solid var(--border)' }}
        >
          <span style={{color: 'var(--text-primary)'}}>{t('stepByStep')}</span>
          <span aria-hidden="true" style={{ color: 'var(--text-muted)', transition: 'transform var(--transition-fast)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
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
              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
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
        className="btn btn-primary"
        aria-label={`Apply for ${form.number} online at ECI portal`}
        style={{ marginTop: 'auto' }}
      >
        {t('applyOnline')}
      </a>
    </article>
  );
}
