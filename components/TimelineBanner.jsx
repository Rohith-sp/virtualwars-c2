import timeline from '@/data/timeline.json';

// Server component — no interactivity needed, pure render.
export default function TimelineBanner() {
  return (
    <section
      aria-label="Election Timeline"
      style={{ padding: 'var(--space-12) var(--space-6)', overflowX: 'auto' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p className="section-subtitle">How Elections Work</p>
        <h2 className="section-title" style={{ marginBottom: 'var(--space-10)' }}>
          The Election Timeline
        </h2>

        {/* Desktop horizontal track */}
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
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
              zIndex: 0,
            }}
          />

          {timeline.map((phase, i) => (
            <div
              key={phase.id}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-3)',
                position: 'relative',
                zIndex: 1,
                animation: `fadeSlideUp var(--dur-slow) ${i * 80}ms var(--ease) both`,
              }}
            >
              {/* Node */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  border: `2.5px solid ${phase.accentColor}`,
                  boxShadow: `0 0 16px ${phase.accentColor}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0,
                  transition: 'transform var(--dur-base) var(--ease)',
                }}
                aria-hidden="true"
              >
                {phase.icon}
              </div>

              {/* Label */}
              <div style={{ textAlign: 'center', padding: '0 var(--space-2)' }}>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: phase.accentColor,
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {phase.phase}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    maxWidth: '120px',
                  }}
                >
                  {phase.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
