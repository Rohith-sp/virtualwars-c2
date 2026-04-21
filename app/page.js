'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import FlowChat from '@/components/FlowChat';
import ChatWindow from '@/components/ChatWindow';
import FactsTicker from '@/components/FactsTicker';
import TimelineBanner from '@/components/TimelineBanner';
import FormCard from '@/components/FormCard';
import ProblemCard from '@/components/ProblemCard';
import EpicFormatter from '@/components/EpicFormatter';
import BoothLocator from '@/components/BoothLocator';
import ShareCard from '@/components/ShareCard';
import forms from '@/data/forms.json';
import problems from '@/data/problems.json';

// Simulation modal — dynamically imported, no SSR, deferred bundle
const SimulationModal = dynamic(() => import('@/components/SimulationModal'), { ssr: false });

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* ── Navigation ───────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(7,13,26,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 var(--space-6)',
        }}
      >
        <nav
          aria-label="Primary navigation"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <a href="#main-content" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none' }} aria-label="VoteGuide India home">
            <span style={{ fontSize: '1.5rem' }}>🗳️</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
              VoteGuide<span style={{ color: 'var(--color-primary)' }}>India</span>
            </span>
          </a>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <a href="#guide" className="btn btn-ghost btn-sm" style={{ borderRadius: 'var(--radius-sm)' }}>Guide</a>
            <a href="#forms" className="btn btn-ghost btn-sm" style={{ borderRadius: 'var(--radius-sm)' }}>Forms</a>
            <a href="#ai-chat" className="btn btn-ghost btn-sm" style={{ borderRadius: 'var(--radius-sm)' }}>AI Chat</a>
            <button
              className="btn btn-primary btn-sm animate-pulse-glow"
              onClick={() => setModalOpen(true)}
              aria-label="Open vote simulation"
            >
              🗳️ Try Simulation
            </button>
          </div>
        </nav>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main id="main-content">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: 'var(--space-20) var(--space-6) var(--space-16)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-12)',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div>
              <p className="section-subtitle">India&apos;s Voter Information Assistant</p>
              <h1 id="hero-heading" className="animate-fade-up">
                Know Your{' '}
                <span className="text-gradient">Democratic Rights</span>
              </h1>
            </div>
            <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: '480px' }}>
              Register to vote, update your details, find your polling booth, and understand every form — guided by AI, powered by the Election Commission of India.
            </p>
            <FactsTicker />
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <a href="#guide" className="btn btn-primary">
                Start Here →
              </a>
              <button
                className="btn btn-ghost"
                onClick={() => setModalOpen(true)}
                aria-label="Practice voting in a simulation"
              >
                🗳️ Practice Voting
              </button>
            </div>
          </div>

          {/* Hero stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-4)',
            }}
          >
            {[
              { value: '96Cr+', label: 'Registered Voters', icon: '👥', color: 'var(--color-primary)' },
              { value: '7', label: 'Forms Covered', icon: '📋', color: 'var(--color-secondary)' },
              { value: '10Lac+', label: 'Polling Stations', icon: '🏛️', color: 'var(--color-success)' },
              { value: '1950', label: 'Voter Helpline', icon: '📞', color: 'var(--color-warning)' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card-glass animate-fade-up"
                style={{ padding: 'var(--space-5)', textAlign: 'center' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }} aria-hidden="true">{stat.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        {/* ── Timeline ──────────────────────────────────────────────── */}
        <TimelineBanner />

        <hr className="divider" aria-hidden="true" />

        {/* ── Flow Guide ────────────────────────────────────────────── */}
        <section
          id="guide"
          aria-labelledby="guide-heading"
          className="section"
        >
          <p className="section-subtitle">Step-by-Step Chatbot</p>
          <h2 id="guide-heading" className="section-title">
            Your Personalised Voter Guide
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '560px' }}>
            Answer a few questions and get tailored instructions — no searching through PDFs required.
          </p>
          <div style={{ maxWidth: '680px' }}>
            <FlowChat />
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        {/* ── Form Cards ────────────────────────────────────────────── */}
        <section
          id="forms"
          aria-labelledby="forms-heading"
          className="section"
        >
          <p className="section-subtitle">Electoral Forms Explained</p>
          <h2 id="forms-heading" className="section-title">
            Every Form You Need to Know
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)',
              marginTop: 'var(--space-8)',
            }}
          >
            {forms.map((form) => (
              <FormCard key={form.id} form={form} />
            ))}
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        {/* ── Problem Cards ─────────────────────────────────────────── */}
        <section
          aria-labelledby="problems-heading"
          className="section"
        >
          <p className="section-subtitle">Common Issues</p>
          <h2 id="problems-heading" className="section-title">
            Got a Problem? We&apos;ve Got the Fix
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-5)',
              marginTop: 'var(--space-8)',
            }}
          >
            {problems.map((p) => (
              <ProblemCard key={p.id} problem={p} />
            ))}
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        {/* ── EPIC Formatter ────────────────────────────────────────── */}
        <section
          aria-labelledby="epic-heading"
          className="section"
          style={{ textAlign: 'center' }}
        >
          <p className="section-subtitle">Voter ID Tool</p>
          <h2 id="epic-heading" className="section-title" style={{ marginBottom: 'var(--space-8)' }}>
            Validate Your EPIC Number
          </h2>
          <EpicFormatter />
        </section>

        <hr className="divider" aria-hidden="true" />

        {/* ── AI Chat ───────────────────────────────────────────────── */}
        <section
          id="ai-chat"
          aria-labelledby="chat-heading"
          className="section"
        >
          <p className="section-subtitle">AI Assistant</p>
          <h2 id="chat-heading" className="section-title">
            Ask Anything About Voting
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '560px' }}>
            Free-text questions answered by Gemini AI — trained to cover only Indian election topics.
          </p>
          <div style={{ maxWidth: '680px' }}>
            <ChatWindow />
          </div>
        </section>

        <hr className="divider" aria-hidden="true" />

        {/* ── Booth Locator ─────────────────────────────────────────── */}
        <section
          aria-labelledby="booth-heading"
          className="section"
          style={{ textAlign: 'center' }}
        >
          <p className="section-subtitle">Polling Booth</p>
          <h2 id="booth-heading" className="section-title" style={{ marginBottom: 'var(--space-8)' }}>
            Find Your Polling Booth
          </h2>
          <BoothLocator />
        </section>

        <hr className="divider" aria-hidden="true" />

        {/* ── Share Card ────────────────────────────────────────────── */}
        <section
          aria-labelledby="share-heading"
          className="section"
          style={{ textAlign: 'center' }}
        >
          <p className="section-subtitle">Spread the Word</p>
          <h2 id="share-heading" className="section-title" style={{ marginBottom: 'var(--space-4)' }}>
            Share Your Voter Pride
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '480px', margin: '0 auto var(--space-8)' }}>
            Download a personalised voter card and inspire others to register and vote.
          </p>
          <ShareCard />
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: 'var(--space-10) var(--space-6)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Built for democracy · Data sourced from{' '}
          <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">ECI</a>
          {' '}· Not an official government service
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
          Voter Helpline: <strong style={{ color: 'var(--text-secondary)' }}>1950</strong>
          {' '}· <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">voters.eci.gov.in</a>
        </p>
      </footer>

      {/* ── Simulation Modal (dynamically imported, ssr:false) ────────── */}
      <SimulationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
