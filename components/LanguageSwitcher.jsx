'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useTransition } from 'react';

const LANGUAGES = [
  { code: 'en', native: 'English', emoji: '🇬🇧' },
  { code: 'hi', native: 'हिन्दी', emoji: '🇮🇳' },
  { code: 'bn', native: 'বাংলা', emoji: '🇮🇳' },
  { code: 'te', native: 'తెలుగు', emoji: '🇮🇳' },
  { code: 'ta', native: 'தமிழ்', emoji: '🇮🇳' },
  { code: 'mr', native: 'मराठी', emoji: '🇮🇳' },
  { code: 'gu', native: 'ગુજરાતી', emoji: '🇮🇳' },
  { code: 'kn', native: 'ಕನ್ನಡ', emoji: '🇮🇳' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', emoji: '🇮🇳' },
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const ref = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const switchLanguage = (newLocale) => {
    if (newLocale === locale) return setIsOpen(false);
    
    setIsOpen(false);
    startTransition(() => {
      // Replaces the leading locale in the pathname
      // Since middleware prepends it, we safely replace it
      const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
      
      localStorage.setItem('voteguide_locale', newLocale);
      router.replace(newPath);
    });
  };

  return (
    <div className="relative" ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-sm"
        disabled={isPending}
        aria-label="Switch language"
        aria-expanded={isOpen}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{currentLang.native.substring(0, 3)}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            minWidth: '180px',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                textAlign: 'left',
                borderLeft: lang.code === locale ? '3px solid var(--accent-saffron)' : '3px solid transparent',
                background: lang.code === locale ? 'var(--accent-saffron-light)' : 'transparent',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (lang.code !== locale) e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (lang.code !== locale) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span aria-hidden="true">{lang.emoji}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{lang.native}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lang.native !== lang.code ? lang.code.toUpperCase() : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
