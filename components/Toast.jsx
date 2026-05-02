'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

// Global helper to trigger toasts from anywhere
export const showToast = (message, type = 'info') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  }
};

export default function Toast() {
  const t = useTranslations('common');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { message, type } = e.detail;
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto dismiss after 4s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--space-6)',
        right: 'var(--space-6)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        pointerEvents: 'none',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .toast-container {
            right: 50% !important;
            transform: translateX(50%);
            width: 90vw;
            max-width: 400px;
          }
        }
        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div className="toast-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map((toast) => {
          let borderColor = 'var(--accent-blue)';
          if (toast.type === 'success') borderColor = 'var(--accent-green)';
          if (toast.type === 'error') borderColor = 'var(--accent-red)';

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                background: 'var(--bg-surface)',
                borderLeft: `4px solid ${borderColor}`,
                boxShadow: 'var(--shadow-lg)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                minWidth: '280px',
              }}
              role="alert"
            >
              <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                aria-label={t('dismiss')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
