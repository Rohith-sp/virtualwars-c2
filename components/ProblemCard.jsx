'use client';

import { useTranslations } from 'next-intl';

export default function ProblemCard({ problem, onNavigate }) {
  const t = useTranslations('problems');
  
  const URGENCY_LABEL = { 
    high: t('urgency.high'), 
    medium: t('urgency.medium'), 
    low: t('urgency.low') 
  };

  const handleClick = () => {
    if (onNavigate && problem.formId) {
      onNavigate(problem.formId);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className="card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`${t(`data.${problem.id}.problem`)} — ${t('getHelp')}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 'var(--space-4)',
        padding: 'var(--space-6)',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        height: '100%',
        transition: 'transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast)',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--accent-blue)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-focus)';
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-blue-light)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)', width: '100%' }}>
        <span style={{ fontSize: '2rem', lineHeight: 1 }} aria-hidden="true">{problem.emoji}</span>
        <span className={`badge badge-${problem.urgency}`}>
          {URGENCY_LABEL[problem.urgency]}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: 'var(--space-2)' }}>
          {t(`data.${problem.id}.problem`)}
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {t(`data.${problem.id}.solution`)}
        </div>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 600, marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {t('getHelp')} <span style={{ fontSize: '1.1em' }}>→</span>
      </div>
    </div>
  );
}
