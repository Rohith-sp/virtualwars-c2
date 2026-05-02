'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useScrollReveal } from '@/lib/useScrollReveal';
import FlowChat from '@/components/FlowChat';
import ChatWindow from '@/components/ChatWindow';
import ErrorBoundary from '@/components/ErrorBoundary';
import FactsTicker from '@/components/FactsTicker';
import TimelineBanner from '@/components/TimelineBanner';
import FormCard from '@/components/FormCard';
import ProblemCard from '@/components/ProblemCard';
import EpicFormatter from '@/components/EpicFormatter';
import BoothLocator from '@/components/BoothLocator';
import CandidateSearch from '@/components/CandidateSearch';
import ManifestoCompare from '@/components/ManifestoCompare';
import MythBuster from '@/components/MythBuster';
import ShareCard from '@/components/ShareCard';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import forms from '@/data/forms.json';
import problems from '@/data/problems.json';

const SimulationModal = dynamic(() => import('@/components/SimulationModal'), { ssr: false });

// Nav items — each maps to a section id
const NAV_ITEMS = [
  { id: 'guide',      icon: '🧭', key: 'guide' },
  { id: 'forms',      icon: '📋', key: 'forms' },
  { id: 'timeline',   icon: '📅', key: 'timeline' },
  { id: 'candidates', icon: '🔍', key: 'candidates' },
  { id: 'manifesto',  icon: '⚖️', key: 'manifesto' },
  { id: 'mythbuster', icon: '🛡️', key: 'mythbuster' },
  { id: 'booth',      icon: '🏛️', key: 'booth' },
  { id: 'share',      icon: '🎴', key: 'share' },
];

export default function Home() {
  const tNav = useTranslations('nav');
  const tHero = useTranslations('hero');
  const tFlow = useTranslations('flow');
  const tBooth = useTranslations('boothLocator');
  const tShare = useTranslations('shareCard');
  const tFooter = useTranslations('footer');
  const tForms = useTranslations('forms');
  const tProblems = useTranslations('problems');
  const tEpic = useTranslations('epic');

  useScrollReveal();
  const [modalOpen, setModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const menuRef = useRef(null);

  // Track which section is in viewport for active nav highlight
  useEffect(() => {
    const ids = ['guide', 'forms', 'timeline', 'candidates', 'manifesto', 'mythbuster', 'booth', 'share'];
    const observers = ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.3 }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      <style>{`
        .hero-pattern {
          background-image: radial-gradient(var(--border) 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }
        .hero-title-border {
          border-left: 3px solid var(--accent-saffron);
          padding-left: var(--space-4);
        }
        /* ── Top bar ── */
        .nav-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          gap: 12px;
        }
        /* ── Section link strip (below topbar) ── */
        .nav-strip {
          display: flex;
          align-items: center;
          gap: 2px;
          overflow-x: auto;
          scrollbar-width: none;
          border-top: 1px solid var(--border);
          padding: 4px 0;
          -webkit-overflow-scrolling: touch;
        }
        .nav-strip::-webkit-scrollbar { display: none; }
        .nav-link {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          padding: 5px 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.15s, background 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .nav-link:hover { color: var(--text-primary); background: var(--bg-subtle); }
        .nav-link.active {
          color: var(--accent-saffron);
          background: var(--accent-saffron-light);
          font-weight: 700;
        }
        /* ── Hamburger (mobile only) ── */
        .hamburger-btn {
          background: transparent;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          width: 38px;
          height: 38px;
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-primary);
          flex-shrink: 0;
        }
        /* ── Mobile drawer ── */
        .nav-drawer {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-surface);
          border-bottom: 2px solid var(--border);
          padding: 8px 16px 16px;
          z-index: 200;
          flex-direction: column;
          gap: 2px;
          box-shadow: var(--shadow-lg);
          max-height: 70vh;
          overflow-y: auto;
        }
        .nav-drawer.open { display: flex; }
        .nav-drawer-item {
          width: 100%;
          text-align: left;
          padding: 10px 14px;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.15s;
        }
        .nav-drawer-item:hover { background: var(--bg-subtle); color: var(--text-primary); }
        .nav-drawer-item.active { background: var(--accent-saffron-light); color: var(--accent-saffron); font-weight: 700; }
        .nav-drawer-badge {
          margin-left: auto;
          font-size: 0.65rem;
          background: var(--accent-saffron);
          color: white;
          padding: 2px 8px;
          border-radius: 99px;
          font-weight: 700;
        }
        /* ── Responsive ── */
        @media (max-width: 768px) {
          .hamburger-btn { display: flex; }
          .nav-strip { display: none; }
          .nav-hide-mobile { display: none !important; }
          .nav-topbar { height: 56px; }
        }
        @media (min-width: 769px) {
          .nav-drawer { display: none !important; }
          .hamburger-btn { display: none !important; }
        }
      `}</style>

      {/* ── Navigation ── */}
      <header ref={menuRef} style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          {/* Top row: logo + controls */}
          <div className="nav-topbar">
            <a href="#main-content" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }} aria-label="VoteGuide India home">
              <span style={{ fontSize: '1.4rem' }}>🗳️</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                VoteGuide<span style={{ color: 'var(--accent-saffron)' }}>.</span>
              </span>
            </a>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <LanguageSwitcher />
              <button onClick={() => setIsChatOpen(true)} className="btn btn-ghost btn-sm">🤖 {tNav('aiChat')}</button>
              <button className="btn btn-primary btn-sm" onClick={() => setModalOpen(true)}>🗳️ {tNav('simulate')}</button>
              {/* Hamburger — mobile only */}
              <button
                className="hamburger-btn"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
              >
                {menuOpen
                  ? <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>✕</span>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Desktop section link strip */}
          <nav className="nav-strip" aria-label="Section links">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`nav-link${activeSection === item.id ? ' active' : ''}`}
                onClick={() => scrollTo(item.id)}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <span aria-hidden="true">{item.icon}</span>
                {tNav(item.key)}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile drawer */}
        <div className={`nav-drawer${menuOpen ? ' open' : ''}`} role="menu" aria-label="Navigation menu">
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 14px 4px' }}>{tNav('sections')}</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-drawer-item${activeSection === item.id ? ' active' : ''}`}
              onClick={() => scrollTo(item.id)}
              role="menuitem"
            >
              <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}>{item.icon}</span>
              <span>{tNav(item.key)}</span>
              {activeSection === item.id && <span className="nav-drawer-badge">{tNav('current')}</span>}
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 14px' }}>{tNav('tools')}</div>
            <button className="nav-drawer-item" onClick={() => { setIsChatOpen(true); setMenuOpen(false); }} role="menuitem">
              <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}>🤖</span>
              <span>{tNav('aiChat')}</span>
            </button>
            <button className="nav-drawer-item" onClick={() => { setModalOpen(true); setMenuOpen(false); }} role="menuitem">
              <span style={{ fontSize: '1.1rem', width: '24px', textAlign: 'center' }}>🗳️</span>
              <span>{tNav('trySimulation')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main id="main-content">

        {/* ── Hero ── */}
        <section
          aria-labelledby="hero-heading"
          className="hero-pattern container"
          style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-12)', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}
        >
          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="hero-title-border">
              <p className="caption" style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>{tHero('caption')}</p>
              <h1 id="hero-heading">{tHero('headline')}</h1>
            </div>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: '480px' }}>{tHero('subheadline')}</p>
            <FactsTicker />
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <button onClick={() => scrollTo('guide')} className="btn btn-primary" style={{ padding: '0 var(--space-6)' }}>{tHero('ctaPrimary')} →</button>
              <button className="btn btn-outline" onClick={() => setModalOpen(true)} aria-label={tHero('practiceVoting')} style={{ padding: '0 var(--space-6)' }}>
                {tHero('practiceVoting')}
              </button>
            </div>
          </div>

          <div className="grid-2 reveal">
            {[
              { value: tHero('stats.votersVal'), label: tHero('stats.voters'), icon: '👥' },
              { value: tHero('stats.formsVal'),  label: tHero('stats.forms'),  icon: '📋' },
              { value: tHero('stats.stationsVal'), label: tHero('stats.stations'), icon: '🏛️' },
              { value: tHero('stats.helplineVal'), label: tHero('stats.helpline'), icon: '📞' },
            ].map((stat) => (
              <div key={stat.label} className="card reveal" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }} aria-hidden="true">{stat.icon}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'var(--font-display)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Timeline ── */}
        <section id="timeline" className="container reveal"><TimelineBanner /></section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Flow Guide ── */}
        <section id="guide" aria-labelledby="guide-heading" className="container reveal" style={{ textAlign: 'center' }}>
          <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{tFlow('stepByStep')}</p>
          <h2 id="guide-heading" style={{ marginBottom: 'var(--space-4)' }}>{tFlow('guideTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '560px', margin: '0 auto' }}>{tFlow('guideSubtitle')}</p>
          <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'left' }}>
            <ErrorBoundary><FlowChat /></ErrorBoundary>
          </div>
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Form Cards ── */}
        <section id="forms" aria-labelledby="forms-heading" className="container reveal">
          <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{tForms('caption')}</p>
          <h2 id="forms-heading">{tForms('title')}</h2>
          <div className="grid-3" style={{ marginTop: 'var(--space-8)' }}>
            {forms.map((form) => <FormCard key={form.id} form={form} />)}
          </div>
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Problem Cards ── */}
        <section aria-labelledby="problems-heading" className="container reveal">
          <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{tProblems('caption')}</p>
          <h2 id="problems-heading">{tProblems('title')}</h2>
          <div className="grid-3" style={{ marginTop: 'var(--space-8)' }}>
            {problems.map((p) => (
              <ProblemCard key={p.id} problem={p} onNavigate={(formId) => {
                const target = document.getElementById(formId);
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  target.style.transition = 'box-shadow 0.3s ease';
                  target.style.boxShadow = '0 0 0 4px var(--accent-saffron)';
                  setTimeout(() => { target.style.boxShadow = 'var(--shadow-md)'; }, 1500);
                } else { document.getElementById('forms')?.scrollIntoView({ behavior: 'smooth' }); }
              }} />
            ))}
          </div>
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── EPIC Formatter ── */}
        <section aria-labelledby="epic-heading" className="container reveal" style={{ textAlign: 'center' }}>
          <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{tEpic('caption')}</p>
          <h2 id="epic-heading" style={{ marginBottom: 'var(--space-8)' }}>{tEpic('titleLabel')}</h2>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}><EpicFormatter /></div>
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Booth Locator ── */}
        <section id="booth" aria-labelledby="booth-heading" className="container reveal" style={{ textAlign: 'center' }}>
          <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{tBooth('caption')}</p>
          <h2 id="booth-heading" style={{ marginBottom: 'var(--space-8)' }}>{tBooth('title')}</h2>
          <BoothLocator />
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Candidate Search ── */}
        <section id="candidates" className="container reveal">
          <ErrorBoundary><CandidateSearch /></ErrorBoundary>
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Manifesto Compare ── */}
        <section id="manifesto" className="container reveal">
          <ErrorBoundary><ManifestoCompare /></ErrorBoundary>
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Myth-Buster ── */}
        <section id="mythbuster" className="container reveal">
          <ErrorBoundary><MythBuster /></ErrorBoundary>
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Share Card ── */}
        <section id="share" aria-labelledby="share-heading" className="container reveal" style={{ textAlign: 'center', paddingBottom: 'var(--space-16)' }}>
          <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{tShare('caption')}</p>
          <h2 id="share-heading" style={{ marginBottom: 'var(--space-4)' }}>{tShare('title')}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '480px', margin: '0 auto' }}>{tShare('subtitle')}</p>
          <ShareCard />
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-10) 0', textAlign: 'center', background: 'var(--bg-surface)' }}>
        <div className="container">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {tFooter('builtForDemocracy')} <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>ECI</a> · {tFooter('notOfficial')}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
            {tFooter('voterHelpline')} <strong style={{ color: 'var(--text-secondary)' }}>1950</strong> · <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>voters.eci.gov.in</a>
          </p>
        </div>
      </footer>

      {/* ── Simulation Modal ── */}
      <ErrorBoundary>
        <SimulationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </ErrorBoundary>

      {/* ── Floating AI Button ── */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          aria-label="Open AI Assistant"
          style={{
            position: 'fixed', bottom: 'var(--space-6)', right: 'var(--space-6)', zIndex: 90,
            width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-surface)',
            color: 'var(--accent-blue)', border: '2px solid var(--accent-blue)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-md)', transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* ── AI Chat Sidebar ── */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, width: 400, maxWidth: '100vw', height: '100dvh',
          zIndex: 1000, transform: isChatOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s var(--transition-base)',
          boxShadow: isChatOpen ? 'var(--shadow-lg)' : 'none', willChange: 'transform',
        }}
        aria-hidden={!isChatOpen}
      >
        <ChatWindow onClose={() => setIsChatOpen(false)} />
      </div>
    </>
  );
}
