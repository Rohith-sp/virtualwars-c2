'use client';

import { useState } from 'react';

export default function BoothLocator() {
  const [pincode, setPincode] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isValid = /^\d{6}$/.test(pincode);

  const handleECI = (e) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitted(true);
    window.open(
      `https://electoralsearch.eci.gov.in/`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=polling+station+near+${pincode}+India`;

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left', padding: 'var(--space-8)' }}>
      <h3 style={{ marginBottom: 'var(--space-2)' }}>
        Search by Pincode
      </h3>
      <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-6)', color: 'var(--text-secondary)' }}>
        Enter your 6-digit pincode to locate your nearest polling booth.
      </p>

      <form onSubmit={handleECI} noValidate>
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
            onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setSubmitted(false); }}
            placeholder="e.g. 110001"
            aria-label="Enter your 6-digit pincode"
            style={{ flex: 1, paddingLeft: '40px' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isValid}
            aria-label="Search ECI for polling booth"
            style={{ flexShrink: 0 }}
          >
            Search
          </button>
        </div>
      </form>

      {submitted && isValid && (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: 'var(--space-4)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
            <div style={{ fontSize: '1.25rem', color: 'var(--accent-blue)', marginTop: '2px' }}>📍</div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                ECI portal opened in a new tab.
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                If it didn&apos;t load, you can use Google Maps as a fallback to locate nearby booths.
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                aria-label={`Search polling booths near pincode ${pincode} on Google Maps`}
              >
                Open Maps
              </a>
            </div>
          </div>
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-6)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
        Alternatively, SMS <strong style={{color: 'var(--text-primary)'}}>ECIVIC</strong> to <strong style={{color: 'var(--text-primary)'}}>1950</strong> or call the Voter Helpline.
      </p>
    </div>
  );
}
