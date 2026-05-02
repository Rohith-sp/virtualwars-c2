'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function CandidateSearch() {
  const t = useTranslations('searchCandidates');
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const res = await fetch(`/api/candidates?constituency=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch (err) {
      setError('Could not load candidate data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--space-2)' }}>{t('caption')}</p>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>{t('title')}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{t('description')}</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 'var(--space-10)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--space-3)', width: '100%', maxWidth: '600px' }}>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('placeholder')}
            className="input"
            style={{ flexGrow: 1, padding: 'var(--space-4) var(--space-5)', fontSize: '1rem', boxShadow: 'var(--shadow-sm)' }}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 var(--space-8)' }} disabled={loading}>
            {loading ? '...' : t('searchButton')}
          </button>
        </form>
      </div>

      {error && <p style={{ color: 'var(--accent-red)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>{error}</p>}

      {hasSearched && !loading && candidates.length === 0 && !error && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>{t('noResults')}</p>
      )}

      {!loading && candidates.length > 0 && (
        <div style={{ display: 'grid', gap: 'var(--space-6)', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', width: '100%' }}>
          {candidates.map((c, i) => (
            <div 
              key={c.id || i} 
              className="card" 
              style={{ 
                padding: 'var(--space-6)', 
                borderTop: '6px solid var(--accent-blue)', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 'var(--space-5)',
                boxShadow: 'var(--shadow-md)',
                transition: 'transform 0.2s ease',
                textAlign: 'left'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{c.name}</h3>
                  <div style={{ fontSize: '1.25rem' }}>{c.age} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{t('labels.years')}</span></div>
                </div>
                <div style={{ display: 'inline-block', background: 'var(--accent-blue-light)', color: 'var(--accent-blue)', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  {c.party}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: '1.1rem', width: '24px' }}>🎓</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{t('labels.education')}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{c.education}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: '1.1rem', width: '24px' }}>💰</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{t('labels.assets')}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{c.assets}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: '1.1rem', width: '24px' }}>⚖️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{t('labels.criminal')}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: c.criminalCases > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                      {c.criminalCases === 0 ? t('labels.noCases') : t('labels.casesCount', { count: c.criminalCases })}
                    </div>
                  </div>
                </div>
              </div>

              {c.profileUrl && (
                <a 
                  href={c.profileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-outline btn-sm" 
                  style={{ marginTop: 'auto', width: '100%', justifyContent: 'center', border: '1px solid var(--border)' }}
                >
                  🌐 {t('labels.verifiedProfile')} →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
