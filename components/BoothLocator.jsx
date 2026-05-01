'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const BoothMap = dynamic(() => import('./BoothMap'), { ssr: false, loading: () => <p>Loading map...</p> });

export default function BoothLocator() {
  const t = useTranslations('boothLocator');
  const tCommon = useTranslations('common');
  const [pincode, setPincode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = /^\d{6}$/.test(pincode);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitted(true);
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`);
      const data = await res.json();
      if (data && data.length > 0) {
        setMapData({
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          address: data[0].display_name
        });
      } else {
        setError(t('noResults'));
      }
    } catch (err) {
      setError(tCommon('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left', padding: 'var(--space-8)' }}>
      <h3 style={{ marginBottom: 'var(--space-2)' }}>
        {t('pincodeLabel')}
      </h3>
      <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-6)', color: 'var(--text-secondary)' }}>
        {t('pincodeDesc')}
      </p>

      <form onSubmit={handleSearch} noValidate>
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            🔍
          </div>
          <input
            id="pincode-input"
            className="input"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={pincode}
            onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setSubmitted(false); setMapData(null); }}
            placeholder={t('searchPlaceholder')}
            aria-label="Enter your 6-digit pincode"
            style={{ flex: 1, paddingLeft: '40px' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isValid || loading}
            aria-label={t('search')}
            style={{ flexShrink: 0 }}
          >
            {loading ? t('loading') : t('search')}
          </button>
        </div>
      </form>

      {error && <p style={{ color: 'var(--accent-red)', fontSize: '0.875rem' }}>{error}</p>}

      {mapData && (
        <div style={{ marginTop: 'var(--space-4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <BoothMap lat={mapData.lat} lon={mapData.lon} address={mapData.address} />
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-6)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
        {t.rich('smsAlternative', {
          code: (chunks) => <strong style={{color: 'var(--text-primary)'}}>ECIVIC</strong>,
          number: (chunks) => <strong style={{color: 'var(--text-primary)'}}>1950</strong>
        })}
      </p>
    </div>
  );
}
