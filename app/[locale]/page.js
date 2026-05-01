'use client';

import { useState } from 'react';
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
import ShareCard from '@/components/ShareCard';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import forms from '@/data/forms.json';
import problems from '@/data/problems.json';

// Simulation modal — dynamically imported, no SSR, deferred bundle
const SimulationModal = dynamic(() => import('@/components/SimulationModal'), { ssr: false });

export default function Home() {
  const tNav = useTranslations('nav');
  const tHero = useTranslations('hero');
  const tFlow = useTranslations('flow');
  const tChat = useTranslations('chat');
  const tBooth = useTranslations('boothLocator');
  const tShare = useTranslations('shareCard');
  const tFooter = useTranslations('footer');
  const tForms = useTranslations('forms');
  const tProblems = useTranslations('problems');
  const tEpic = useTranslations('epic');

  useScrollReveal();
  const [modalOpen, setModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);

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
        .nav-scrolled {
          box-shadow: var(--shadow-sm);
        }
      `}</style>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <nav
          className="container"
          aria-label="Primary navigation"
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <a href="#main-content" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none' }} aria-label="VoteGuide India home">
            <span style={{ fontSize: '1.5rem' }}>🗳️</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              VoteGuide<span style={{ color: 'var(--accent-saffron)' }}>.</span>
            </span>
          </a>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <LanguageSwitcher />
            <a href="#guide" className="btn btn-ghost btn-sm">{tNav('guide')}</a>
            <a href="#forms" className="btn btn-ghost btn-sm">{tNav('forms')}</a>
            <button onClick={() => setIsChatOpen(true)} className="btn btn-ghost btn-sm">{tNav('aiChat')}</button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setModalOpen(true)}
              aria-label={tNav('trySimulation')}
            >
              {tNav('trySimulation')}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main id="main-content">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          className="hero-pattern container"
          style={{
            paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-12)', alignItems: 'center', minHeight: 'calc(100vh - 64px)'
          }}
        >
          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="hero-title-border">
              <p className="caption" style={{ fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>{tHero('caption')}</p>
              <h1 id="hero-heading">
                {tHero('headline')}
              </h1>
            </div>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: '480px' }}>
              {tHero('subheadline')}
            </p>
            <FactsTicker />
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <a href="#guide" className="btn btn-primary" style={{ padding: '0 var(--space-6)' }}>{tHero('ctaPrimary')} →</a>
              <button
                className="btn btn-outline"
                onClick={() => setModalOpen(true)}
                aria-label={tHero('practiceVoting')}
                style={{ padding: '0 var(--space-6)' }}
              >
                {tHero('practiceVoting')}
              </button>
            </div>
          </div>

          <div className="grid-2 reveal">
            {[
              { value: '96Cr+', label: tHero('stats.voters'), icon: '👥' },
              { value: '7', label: tHero('stats.forms'), icon: '📋' },
              { value: '10Lac+', label: tHero('stats.stations'), icon: '🏛️' },
              { value: '1950', label: tHero('stats.helpline'), icon: '📞' },
            ].map((stat, i) => (
              <div key={stat.label} className="card reveal" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }} aria-hidden="true">{stat.icon}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'var(--font-display)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Timeline ──────────────────────────────────────────────── */}
        <section className="container reveal"><TimelineBanner /></section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Flow Guide ────────────────────────────────────────────── */}
        <section id="guide" aria-labelledby="guide-heading" className="container reveal" style={{ textAlign: 'center' }}>
          <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{tFlow('stepByStep')}</p>
          <h2 id="guide-heading" style={{ marginBottom: 'var(--space-4)' }}>{tFlow('guideTitle')}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '560px', margin: '0 auto' }}>
            {tFlow('guideSubtitle')}
          </p>
          <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'left' }}>
            <ErrorBoundary>
              <FlowChat />
            </ErrorBoundary>
          </div>
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Form Cards ────────────────────────────────────────────── */}
        <section id="forms" aria-labelledby="forms-heading" className="container reveal">
          <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{tForms('caption')}</p>
          <h2 id="forms-heading">{tForms('title')}</h2>
          <div className="grid-3" style={{ marginTop: 'var(--space-8)' }}>
            {forms.map((form) => (
              <FormCard key={form.id} form={form} />
            ))}
          </div>
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Problem Cards ─────────────────────────────────────────── */}
        <section aria-labelledby="problems-heading" className="container reveal">
          <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{tProblems('caption')}</p>
          <h2 id="problems-heading">{tProblems('title')}</h2>
          <div className="grid-3" style={{ marginTop: 'var(--space-8)' }}>
            {problems.map((p) => (
              <ProblemCard
                key={p.id}
                problem={p}
                onNavigate={(formId) => {
                  const target = document.getElementById(formId);
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.style.transition = 'box-shadow 0.3s ease';
                    target.style.boxShadow = '0 0 0 4px var(--accent-saffron)';
                    setTimeout(() => {
                      target.style.boxShadow = 'var(--shadow-md)';
                    }, 1500);
                  } else {
                    document.getElementById('forms')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              />
            ))}
          </div>
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── EPIC Formatter ────────────────────────────────────────── */}
        <section aria-labelledby="epic-heading" className="container reveal" style={{ textAlign: 'center' }}>
          <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{tEpic('caption')}</p>
          <h2 id="epic-heading" style={{ marginBottom: 'var(--space-8)' }}>{tEpic('titleLabel')}</h2>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            <EpicFormatter />
          </div>
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Booth Locator ─────────────────────────────────────────── */}
        <section aria-labelledby="booth-heading" className="container reveal" style={{ textAlign: 'center' }}>
          <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{tBooth('caption')}</p>
          <h2 id="booth-heading" style={{ marginBottom: 'var(--space-8)' }}>{tBooth('title')}</h2>
          <BoothLocator />
        </section>

        <hr className="divider container" aria-hidden="true" />

        {/* ── Share Card ────────────────────────────────────────────── */}
        <section aria-labelledby="share-heading" className="container reveal" style={{ textAlign: 'center', paddingBottom: 'var(--space-16)' }}>
          <p className="caption" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{tShare('caption')}</p>
          <h2 id="share-heading" style={{ marginBottom: 'var(--space-4)' }}>{tShare('title')}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '480px', margin: '0 auto' }}>
            {tShare('subtitle')}
          </p>
          <ShareCard />
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-10) 0', textAlign: 'center', background: 'var(--bg-surface)' }}>
        <div className="container">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {tFooter('builtForDemocracy')} <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer" style={{color: 'var(--accent-blue)', textDecoration: 'underline'}}>ECI</a> · {tFooter('notOfficial')}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
            {tFooter('voterHelpline')} <strong style={{ color: 'var(--text-secondary)' }}>1950</strong> · <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" style={{color: 'var(--accent-blue)', textDecoration: 'underline'}}>voters.eci.gov.in</a>
          </p>
        </div>
      </footer>

      {/* ── Simulation Modal ────────── */}
      <ErrorBoundary>
        <SimulationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </ErrorBoundary>

      {/* ── Floating AI Button ───────────────────────────────────────── */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          aria-label="Open AI Assistant"
          style={{
            position: 'fixed',
            bottom: 'var(--space-6)',
            right: 'var(--space-6)',
            zIndex: 90,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            color: 'var(--accent-blue)',
            border: '2px solid var(--accent-blue)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* ── AI Chat Sidebar ──────────────────────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 400,
          maxWidth: '100vw',
          height: '100dvh',
          zIndex: 1000,
          transform: isChatOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s var(--transition-base)',
          boxShadow: isChatOpen ? 'var(--shadow-lg)' : 'none',
          willChange: 'transform',
        }}
        aria-hidden={!isChatOpen}
      >
        <ChatWindow onClose={() => setIsChatOpen(false)} />
      </div>
    </>
  );
}
