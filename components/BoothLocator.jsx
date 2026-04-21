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
      `https://voters.eci.gov.in/download-eroll?ac=&pincode=${pincode}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const mapsUrl = `https://www.google.com/maps/search/polling+booth+near+${pincode}+India`;

  return (
    <div className="card-glass" style={{ padding: 'var(--space-8)', maxWidth: '500px', margin: '0 auto' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-2)' }}>
        Booth Locator
      </p>
      <h3 style={{ marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>
        Find Your Polling Booth
      </h3>
      <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-6)', color: 'var(--text-secondary)' }}>
        Enter your 6-digit pincode to locate your nearest polling booth.
      </p>

      <form onSubmit={handleECI} noValidate>
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <input
            id="pincode-input"
            className="input"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={pincode}
            onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setSubmitted(false); }}
            placeholder="110001"
            aria-label="Enter your 6-digit pincode"
            style={{ flex: 1 }}
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
            background: 'var(--color-primary-dim)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
            🗳️ ECI search opened in a new tab. If it didn&apos;t load correctly, use Google Maps:
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
            aria-label={`Search polling booths near pincode ${pincode} on Google Maps`}
          >
            📍 Open Google Maps Fallback
          </a>
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>
        Alternatively, SMS <strong>ECIVIC</strong> to <strong>1950</strong> or call the Voter Helpline.
      </p>
    </div>
  );
}
