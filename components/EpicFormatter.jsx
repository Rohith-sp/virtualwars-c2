'use client';

import { useState } from 'react';

const EPIC_REGEX = /^[A-Z]{3}[0-9]{7}$/;

export default function EpicFormatter() {
  const [value, setValue] = useState('');
  const [copied, setCopied] = useState(false);

  const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const isValid = EPIC_REGEX.test(raw);
  const formatted = isValid ? `${raw.slice(0, 3)} ${raw.slice(3, 7)} ${raw.slice(7)}` : raw;

  const handleCopy = () => {
    navigator.clipboard.writeText(raw).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="card-glass"
      style={{ padding: 'var(--space-8)', maxWidth: '480px', margin: '0 auto' }}
    >
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-2)' }}>
        EPIC Validator
      </p>
      <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
        Verify Your Voter ID Number
      </h3>

      <input
        id="epic-input"
        className="input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. ABC1234567"
        maxLength={10}
        aria-label="Enter your EPIC voter ID number"
        autoComplete="off"
        spellCheck={false}
        style={{ marginBottom: 'var(--space-4)', fontFamily: 'monospace', letterSpacing: '0.1em' }}
      />

      {raw.length > 0 && (
        <div
          style={{
            background: isValid ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1.5px solid ${isValid ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
          }}
          role="status"
          aria-live="polite"
        >
          <div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '1.375rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                color: isValid ? 'var(--color-success)' : 'var(--color-danger)',
              }}
            >
              {formatted || '—'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {isValid ? '✓ Valid EPIC format (3 letters + 7 digits)' : 'Format: 3 capital letters followed by 7 digits'}
            </div>
          </div>

          {isValid && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleCopy}
              aria-label="Copy EPIC number to clipboard"
              style={{ flexShrink: 0 }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          )}
        </div>
      )}

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Your EPIC number is printed on your Voter ID card. It has 3 capital letters followed by 7 digits.
      </p>
    </div>
  );
}
