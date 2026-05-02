'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

class ErrorBoundaryInternal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            minHeight: '200px',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            textAlign: 'center',
            background: 'rgba(192, 57, 43, 0.05)',
            border: '1px solid rgba(192, 57, 43, 0.2)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p style={{ color: 'var(--accent-red)', fontSize: '1rem', fontWeight: 500 }}>⚠️ {t('errorSection')}</p>
          <button
            className="btn btn-outline"
            onClick={() => this.setState({ hasError: false })}
          >
            {t('retry')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ErrorBoundary({ children }) {
  const t = useTranslations('common');
  return <ErrorBoundaryInternal t={t}>{children}</ErrorBoundaryInternal>;
}
