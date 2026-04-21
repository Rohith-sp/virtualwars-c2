'use client';

const URGENCY_LABEL = { high: 'Urgent', medium: 'Medium', low: 'Low' };

export default function ProblemCard({ problem, onNavigate }) {
  const handleClick = () => {
    if (onNavigate && problem.formId) {
      onNavigate(problem.formId);
    }
  };

  return (
    <button
      className="card-glass"
      onClick={handleClick}
      aria-label={`${problem.problem} — click to get help`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        padding: 'var(--space-5)',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
        border: '1px solid var(--border-subtle)',
        transition: 'transform var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: '1.75rem' }} aria-hidden="true">{problem.emoji}</span>
        <span className={`badge badge-${problem.urgency}`}>
          {URGENCY_LABEL[problem.urgency]}
        </span>
      </div>

      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: 'var(--space-2)' }}>
          {problem.problem}
        </div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {problem.solution}
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
        Get help →
      </div>
    </button>
  );
}
