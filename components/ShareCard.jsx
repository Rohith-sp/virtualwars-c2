'use client';

import { useState, useRef } from 'react';

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
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0f1b35',
        scale: 2,           // retina quality
        useCORS: true,
        logging: false,
      });

      // Direct download the image
      canvas.toBlob((blob) => triggerDownload(blob), 'image/png');
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
      <div
        ref={cardRef}
        style={{
          width: '360px',
          padding: '48px 32px',
          background: 'linear-gradient(135deg, #070d1a 0%, #0f1b35 100%)',
          border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: '24px',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          userSelect: 'none',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          position: 'relative',
          overflow: 'hidden'
        }}
        aria-hidden="true"
      >
        {/* Decorative Indian Flag Glows */}
        <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: 'rgba(255,153,51,0.3)', filter: 'blur(50px)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(19,136,8,0.25)', filter: 'blur(50px)', borderRadius: '50%' }} />
        
        {/* Top Flag Line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🇮🇳</div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.25em', color: '#a8b8d8', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
            Election Commission of India
          </div>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.75rem', 
            fontWeight: 800, 
            color: '#ffffff', 
            marginBottom: '8px',
            lineHeight: 1.2
          }}>
            {displayName}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#ff8c5a', marginBottom: '28px', fontStyle: 'italic' }}>
            Proud Registered Voter
          </div>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255,107,53,0.1)',
              border: '1px solid rgba(255,107,53,0.5)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.8rem',
              padding: '10px 24px',
              borderRadius: '9999px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 12px rgba(255,107,53,0.15)'
            }}
          >
            I Will Vote
          </div>
          <div style={{ marginTop: '32px', fontSize: '0.75rem', color: '#6b7fa3', fontWeight: 500 }}>
            voters.eci.gov.in • 1950 Helpline
          </div>
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
