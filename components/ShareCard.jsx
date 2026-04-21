'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

// html2canvas captures a styled <div> — avoids raw canvas toBlob() privacy blocks
// on static hosts (Firebase, Vercel) that can silently return blank PNGs.

export default function ShareCard() {
  const [name, setName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [shareError, setShareError] = useState('');
  const cardRef = useRef(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    setShareError('');
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0f1b35',
        scale: 2,           // retina quality
        useCORS: true,
        logging: false,
      });

      // Try Web Share API first (mobile)
      if (navigator.share && navigator.canShare) {
        canvas.toBlob(async (blob) => {
          const file = new File([blob], 'my-voter-card.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({ files: [file], title: 'I am a registered voter!', text: 'Exercise your democratic right — register to vote today.' });
              return;
            } catch {
              // User cancelled share or not supported — fall through to download
            }
          }
          triggerDownload(blob);
        }, 'image/png');
      } else {
        canvas.toBlob((blob) => triggerDownload(blob), 'image/png');
      }
    } catch {
      setShareError('Could not generate image. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const triggerDownload = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-voter-card.png';
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayName = name.trim() || 'Your Name';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-6)' }}>
      {/* Preview card — this div is what html2canvas captures */}
      <div
        ref={cardRef}
        style={{
          width: '360px',
          padding: '40px 32px',
          background: 'linear-gradient(135deg, #0f1b35 0%, #162347 100%)',
          border: '2px solid rgba(255,107,53,0.4)',
          borderRadius: '20px',
          textAlign: 'center',
          fontFamily: 'Georgia, serif',
          userSelect: 'none',
        }}
        aria-hidden="true"
      >
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🗳️</div>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: '#6b7fa3', textTransform: 'uppercase', marginBottom: '8px' }}>
          Republic of India
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f0f4ff', marginBottom: '4px' }}>
          {displayName}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#a8b8d8', marginBottom: '24px' }}>
          is a registered voter
        </div>
        <div
          style={{
            display: 'inline-block',
            background: '#ff6b35',
            color: '#1a0800',
            fontWeight: 800,
            fontSize: '0.8125rem',
            padding: '8px 20px',
            borderRadius: '9999px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          I Will Vote
        </div>
        <div style={{ marginTop: '20px', fontSize: '0.7rem', color: '#4a5a7a' }}>
          voters.eci.gov.in • 1950 Voter Helpline
        </div>
      </div>

      {/* Name input */}
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <input
          id="share-name-input"
          className="input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name (optional)"
          maxLength={40}
          aria-label="Your name for the voter card"
        />

        <button
          className="btn btn-primary"
          onClick={handleDownload}
          disabled={generating}
          aria-label="Download your voter card as a PNG image"
          style={{ justifyContent: 'center' }}
        >
          {generating ? 'Generating…' : '⬇ Download Voter Card'}
        </button>

        {shareError && (
          <p role="alert" style={{ fontSize: '0.8rem', color: 'var(--color-danger)', textAlign: 'center' }}>
            {shareError}
          </p>
        )}
      </div>
    </div>
  );
}
