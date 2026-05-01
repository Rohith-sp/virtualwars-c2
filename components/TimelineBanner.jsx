import timeline from '@/data/timeline.json';

export default function TimelineBanner() {
  return (
    <div style={{ textAlign: 'center', width: '100%', overflowX: 'auto', paddingBottom: 'var(--space-6)' }}>
      <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>How Elections Work</p>
      <h2 style={{ marginBottom: 'var(--space-12)' }}>The Election Timeline</h2>

      <div
        style={{
          display: 'flex',
          gap: 0,
          alignItems: 'flex-start',
          position: 'relative',
          minWidth: '700px',
        }}
      >
        {/* Connector line */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '28px',
            left: '28px',
            right: '28px',
            height: '2px',
            background: 'var(--border)',
            zIndex: 0,
          }}
        />

        {timeline.map((phase, i) => (
          <div
            key={phase.id}
            className="reveal"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-3)',
              position: 'relative',
              zIndex: 1,
              transitionDelay: `${i * 100}ms`,
            }}
          >
            {/* Node */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--bg-surface)',
                border: `2px solid var(--accent-blue)`,
                boxShadow: `var(--shadow-sm)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              {phase.icon}
            </div>

            {/* Label */}
            <div style={{ textAlign: 'center', padding: '0 var(--space-2)' }}>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--accent-blue)',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {phase.phase}
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  maxWidth: '160px',
                }}
              >
                {phase.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
