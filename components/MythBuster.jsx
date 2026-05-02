'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

const EXAMPLE_CLAIMS = [
  'You can vote using only your mobile phone on election day',
  'Foreigners can vote in Indian elections if they have Aadhaar',
  'NOTA votes lead to a re-election if they win the majority',
  'You need your voter ID card to vote — no other ID is accepted',
  'Election Commission can delay elections during natural disasters',
];

const VERDICT_STYLES = {
  TRUE:            { bg: 'rgba(42,122,75,0.1)',    border: 'rgba(42,122,75,0.3)',    color: 'var(--accent-green)',  label: 'TRUE' },
  FALSE:           { bg: 'rgba(192,57,43,0.1)',    border: 'rgba(192,57,43,0.25)',   color: 'var(--accent-red)',   label: 'FALSE' },
  'PARTIALLY TRUE':{ bg: 'rgba(230,126,34,0.1)',   border: 'rgba(230,126,34,0.3)',   color: '#E67E22',             label: 'PARTIALLY TRUE' },
  MISLEADING:      { bg: 'rgba(230,126,34,0.1)',   border: 'rgba(230,126,34,0.3)',   color: '#E67E22',             label: 'MISLEADING' },
  UNVERIFIABLE:    { bg: 'rgba(100,100,100,0.08)', border: 'rgba(100,100,100,0.2)',  color: 'var(--text-muted)',   label: 'UNVERIFIABLE' },
};

export default function MythBuster() {
  const t = useTranslations('mythbuster');
  const locale = useLocale();
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e, overrideClaim = null) => {
    if (e?.preventDefault) e.preventDefault();
    const finalClaim = overrideClaim || claim;
    if (!finalClaim.trim() || loading) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/mythbuster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: finalClaim, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data.result);
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const useExample = (ex) => {
    setClaim(ex);
    setResult(null);
    setError('');
  };

  const verdictStyle = result ? (VERDICT_STYLES[result.verdict] || VERDICT_STYLES['UNVERIFIABLE']) : null;

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        @keyframes mythbuster-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .mythbuster-spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: mythbuster-spin 0.7s linear infinite;
          display: inline-block;
        }
        .example-chip {
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.8rem;
          padding: 6px 12px;
          border-radius: var(--radius-pill);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          line-height: 1.4;
        }
        .example-chip:hover {
          border-color: var(--accent-blue);
          color: var(--accent-blue);
          background: var(--accent-blue-light);
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-2)' }}>
          {t('caption')}
        </p>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-3)' }}>{t('title')}</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto' }}>{t('description')}</p>
      </div>

      {/* Input */}
      <form onSubmit={handleCheck} style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={claim}
            onChange={e => { setClaim(e.target.value); setResult(null); setError(''); }}
            placeholder={t('placeholder')}
            className="input"
            rows={3}
            maxLength={500}
            disabled={loading}
            style={{ resize: 'none', width: '100%', padding: 'var(--space-4)', fontSize: '1rem', lineHeight: 1.6, boxSizing: 'border-box' }}
          />
          {claim.length > 400 && (
            <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: '0.75rem', color: claim.length > 480 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
              {500 - claim.length}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!claim.trim() || loading}
          style={{ alignSelf: 'center', padding: '0 var(--space-10)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}
        >
          {loading ? (
            <><span className="mythbuster-spinner" /> {t('checking')}</>
          ) : (
            `🔍 ${t('checkBtn')}`
          )}
        </button>
      </form>

      {/* Example chips */}
      {!result && !loading && (
        <div style={{ marginTop: 'var(--space-6)', maxWidth: '700px', margin: 'var(--space-6) auto 0' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-3)', textAlign: 'center' }}>
            {t('tryExample')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center' }}>
            {EXAMPLE_CLAIMS.map((ex, i) => (
              <button key={i} className="example-chip" onClick={() => useExample(ex)}>
                "{ex}"
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 'var(--space-6)', maxWidth: '700px', margin: 'var(--space-6) auto 0', padding: 'var(--space-4)', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', textAlign: 'center', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Result Card */}
      {result && verdictStyle && (
        <div style={{ marginTop: 'var(--space-8)', maxWidth: '700px', margin: 'var(--space-8) auto 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Verdict Banner */}
          <div style={{ background: verdictStyle.bg, border: `1px solid ${verdictStyle.border}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ fontSize: '3rem' }}>{result.verdictEmoji}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: verdictStyle.color, letterSpacing: '0.05em' }}>
              {result.verdict}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '500px' }}>
              "{claim}"
            </p>
          </div>

          {/* Explanation */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
                📋 {t('explanation')}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>{result.explanation}</p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
                📖 {t('officialSource')}
              </div>
              <p style={{ color: 'var(--accent-blue)', fontSize: '0.9rem', fontWeight: 500 }}>{result.officialSource}</p>
            </div>

            <div style={{ background: 'var(--accent-blue-light)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', borderLeft: '3px solid var(--accent-blue)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
                💡 {t('voterTip')}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{result.tip}</p>
            </div>
          </div>

          <button
            onClick={() => { setResult(null); setClaim(''); }}
            className="btn btn-ghost btn-sm"
            style={{ alignSelf: 'center' }}
          >
            ↺ {t('checkAnother')}
          </button>
        </div>
      )}
    </div>
  );
}
