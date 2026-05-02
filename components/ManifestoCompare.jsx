'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

const PARTIES = [
  'BJP (Bharatiya Janata Party)',
  'INC (Indian National Congress)',
  'AAP (Aam Aadmi Party)',
  'SP (Samajwadi Party)',
  'TMC (Trinamool Congress)',
  'BSP (Bahujan Samaj Party)',
  'NCP (Nationalist Congress Party)',
  'CPI(M) (Communist Party of India - Marxist)',
  'JD(U) (Janata Dal United)',
  'Shiv Sena (UBT)',
  'YSRCP (YSR Congress Party)',
  'TDP (Telugu Desam Party)',
  'DMK (Dravida Munnetra Kazhagam)',
  'AIADMK (All India Anna Dravida Munnetra Kazhagam)',
];

const TOPICS = [
  'Healthcare', 'Education', 'Employment & Jobs', 'Agriculture',
  'Women Empowerment', 'National Security', 'Economy & Taxation',
  'Infrastructure', 'Environment', 'Digital India',
];

export default function ManifestoCompare() {
  const t = useTranslations('manifesto');
  const locale = useLocale();
  const [party1, setParty1] = useState('');
  const [party2, setParty2] = useState('');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = party1 && party2 && topic && party1 !== party2 && !loading;

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/manifesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ party1, party2, topic, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data.comparison);
    } catch (err) {
      setError(err.message || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const VERDICT_COLOR = {
    TRUE: 'var(--accent-green)',
    FALSE: 'var(--accent-red)',
    'PARTIALLY TRUE': '#E67E22',
    MISLEADING: '#E67E22',
    UNVERIFIABLE: 'var(--text-muted)',
  };

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .manifesto-select {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 0.95rem;
          cursor: pointer;
          transition: border-color 0.2s;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }
        .manifesto-select:focus { outline: none; border-color: var(--accent-blue); }
        .manifesto-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          flex: 1;
          min-width: 0;
        }
        .promise-item {
          display: flex;
          gap: var(--space-3);
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        @keyframes manifesto-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .manifesto-loading { animation: manifesto-pulse 1.5s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-2)' }}>
          {t('caption')}
        </p>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-3)' }}>{t('title')}</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto' }}>{t('description')}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleCompare}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('party1Label')}
            </label>
            <select className="manifesto-select" value={party1} onChange={e => setParty1(e.target.value)} disabled={loading}>
              <option value="">{t('selectParty')}</option>
              {PARTIES.map(p => <option key={p} value={p} disabled={p === party2}>{p}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('party2Label')}
            </label>
            <select className="manifesto-select" value={party2} onChange={e => setParty2(e.target.value)} disabled={loading}>
              <option value="">{t('selectParty')}</option>
              {PARTIES.map(p => <option key={p} value={p} disabled={p === party1}>{p}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('topicLabel')}
            </label>
            <select className="manifesto-select" value={topic} onChange={e => setTopic(e.target.value)} disabled={loading}>
              <option value="">{t('selectTopic')}</option>
              {TOPICS.map(tp => <option key={tp} value={tp}>{tp}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!canSubmit}
            style={{ padding: '0 var(--space-10)', opacity: canSubmit ? 1 : 0.5 }}
          >
            {loading ? (
              <span className="manifesto-loading">{t('analyzing')}</span>
            ) : (
              `⚖️ ${t('compareBtn')}`
            )}
          </button>
        </div>
      </form>

      {error && (
        <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', textAlign: 'center', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Topic Badge */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'inline-block', background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', padding: '6px 20px', borderRadius: 'var(--radius-pill)', fontWeight: 700, fontSize: '0.9rem' }}>
              📌 {result.topic}
            </span>
          </div>

          {/* Side-by-Side */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {[result.party1, result.party2].map((party, idx) => (
              <div key={idx} className="manifesto-card" style={{ borderTop: `4px solid ${idx === 0 ? 'var(--accent-saffron)' : 'var(--accent-green)'}` }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{party.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '2px solid var(--border)', paddingLeft: 'var(--space-3)' }}>
                  {party.summary}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('keyPromises')}
                  </div>
                  {(party.keyPromises || []).map((promise, i) => (
                    <div key={i} className="promise-item">
                      <span style={{ color: idx === 0 ? 'var(--accent-saffron)' : 'var(--accent-green)', flexShrink: 0, fontWeight: 700 }}>✦</span>
                      {promise}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-5)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
              {t('verdict')}
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: 1.6 }}>⚖️ {result.verdict}</p>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {t('disclaimer')}
          </p>
        </div>
      )}
    </div>
  );
}
