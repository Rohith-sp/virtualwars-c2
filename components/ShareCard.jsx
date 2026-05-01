'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { showToast } from '@/components/Toast';

export default function ShareCard() {
  const t = useTranslations('shareCard');
  const tCommon = useTranslations('common');
  const [name, setName] = useState('');
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#FFFFFF',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my-voter-card.png';
        a.click();
        URL.revokeObjectURL(url);
        showToast(t('successToast'), 'success');
      }, 'image/png');
    } catch {
      showToast(tCommon('error'), 'error');
    } finally {
      setGenerating(false);
    }
  };

  const displayName = name.trim() || 'Your Name';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-6)' }}>
      <style>{`
        .share-card-wrapper {
          width: 360px;
          max-width: 100%;
        }
        @media (max-width: 480px) {
          .share-card-wrapper {
            transform: scale(0.9);
            transform-origin: top center;
            margin-bottom: -10%;
          }
          .share-download-btn {
            width: 100%;
          }
        }
      `}</style>
      
      <div className="share-card-wrapper">
        <div
          ref={cardRef}
          style={{
            width: '360px',
            padding: '48px 32px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            userSelect: 'none',
            position: 'relative',
            overflow: 'hidden'
          }}
          aria-hidden="true"
        >
          {/* Top Saffron Accent Line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-saffron)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🇮🇳</div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.25em', color: 'var(--accent-blue)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
              {t('eci')}
            </div>
            <div style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.75rem', 
              fontWeight: 700, 
              color: 'var(--text-primary)', 
              marginBottom: '8px',
              lineHeight: 1.2
            }}>
              {displayName}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '28px', fontStyle: 'italic' }}>
              {t('voterStatus')}
            </div>
            <div
              style={{
                display: 'inline-block',
                background: 'var(--accent-saffron-light)',
                border: '1px solid var(--accent-saffron)',
                color: 'var(--accent-saffron)',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '10px 24px',
                borderRadius: 'var(--radius-pill)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {t('pledge')}
            </div>
            <div style={{ marginTop: '32px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {t('helpline')}
            </div>
          </div>
        </div>
      </div>

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
          style={{ textAlign: 'center' }}
        />

        <button
          className="btn btn-primary share-download-btn"
          onClick={handleDownload}
          disabled={generating}
          aria-label="Download your voter card as a PNG image"
          style={{ justifyContent: 'center' }}
        >
          {generating ? tCommon('loading') : `⬇ ${t('download')}`}
        </button>
      </div>
    </div>
  );
}
