'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { buildIndex, getNode, getOptions, isTerminal } from '@/lib/flowEngine';
import { trackEvent, GA_EVENTS } from '@/lib/analytics';

// Simple depth calculator for progress bar
function getMaxDepth(index, startId, memo = {}) {
  if (memo[startId]) return memo[startId];
  const node = getNode(index, startId);
  if (!node || isTerminal(node)) return 1;
  const opts = getOptions(node);
  if (!opts.length) return 1;
  const depths = opts.map(o => getMaxDepth(index, o.nextId, memo));
  const max = 1 + Math.max(...depths);
  memo[startId] = max;
  return max;
}

export default function FlowChat({ initialNodeId = 'root' }) {
  const locale = useLocale();
  const tFlow = useTranslations('flow');
  const [flows, setFlows] = useState(null);

  useEffect(() => {
    import(`@/data/flows/flows.${locale}.json`)
      .then(mod => setFlows(mod.default))
      .catch(() => import(`@/data/flows/flows.en.json`).then(mod => setFlows(mod.default)));
  }, [locale]);

  const flowIndex = useMemo(() => {
    if (!flows) return null;
    trackEvent(GA_EVENTS.FLOW_STARTED, { node_id: initialNodeId });
    return buildIndex(flows);
  }, [flows]); // eslint-disable-line react-hooks/exhaustive-deps

  const [currentId, setCurrentId] = useState(initialNodeId);
  const [history, setHistory] = useState([]);
  const containerRef = useRef(null);

  const safeFlowIndex = flowIndex || {};
  const currentNode = getNode(safeFlowIndex, currentId);
  const options = currentNode ? getOptions(currentNode) : [];
  const terminal = currentNode ? isTerminal(currentNode) : false;

  // Progress calculation
  const maxDepth = useMemo(() => (flowIndex ? getMaxDepth(flowIndex, initialNodeId) : 1), [flowIndex, initialNodeId]);
  const progressPercent = Math.min(100, Math.round(((history.length + 1) / maxDepth) * 100));

  const handleOption = useCallback((option) => {
    setHistory((h) => [...h, currentId]);
    setCurrentId(option.nextId);
    if (isTerminal(getNode(flowIndex, option.nextId))) {
      trackEvent(GA_EVENTS.FLOW_COMPLETED, { terminal_node: option.nextId });
    }
  }, [currentId, flowIndex]);

  const handleBack = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentId(prev);
  }, [history]);

  const handleRestart = useCallback(() => {
    setHistory([]);
    setCurrentId(initialNodeId);
    trackEvent(GA_EVENTS.FLOW_STARTED, { node_id: initialNodeId });
  }, [initialNodeId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack]);

  if (!flows || !flowIndex) {
    return (
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading guide...</p>
      </div>
    );
  }

  if (!currentNode) {
    return (
      <div className="card" style={{ padding: 'var(--space-6)' }}>
        <p style={{ color: 'var(--accent-red)' }}>Error: flow node not found.</p>
      </div>
    );
  }

  const isInfoOrTerminal = terminal || currentNode.type === 'info';

  return (
    <div
      ref={containerRef}
      className="card"
      style={{
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        .flow-option {
          background: var(--bg-subtle);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-family: var(--font-body);
          font-weight: 500;
          text-align: left;
          transition: background var(--transition-fast), border var(--transition-fast), transform var(--transition-fast);
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .flow-option:hover, .flow-option:focus-visible {
          background: var(--bg-hover);
          border-color: var(--accent-blue);
          outline: none;
        }
        .flow-option.active {
          background: var(--accent-saffron-light);
          border-color: var(--accent-saffron);
          color: var(--accent-saffron);
        }
        .flow-reveal {
          animation: slideUp 200ms ease forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Progress Bar */}
      <div
        style={{
          height: '4px',
          background: 'var(--bg-subtle)',
          width: '100%',
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'var(--accent-saffron)',
            width: `${progressPercent}%`,
            transition: 'width var(--transition-base)',
          }}
        />
      </div>

      <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Type badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            {currentNode.type === 'terminal' ? '✓ Answer Ready' : currentNode.type === 'info' ? 'Information' : 'Question'}
          </span>
          {history.length > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Step {history.length + 1}
            </span>
          )}
        </div>

        {/* Node text */}
        <div
          key={currentId} // Remount to re-trigger animation
          className="flow-reveal"
          style={{
            background: isInfoOrTerminal ? 'var(--accent-blue-light)' : 'transparent',
            borderRadius: isInfoOrTerminal ? 'var(--radius-md)' : 0,
            padding: isInfoOrTerminal ? 'var(--space-5)' : 0,
            borderLeft: isInfoOrTerminal ? '3px solid var(--accent-blue)' : 'none',
          }}
        >
          <p style={{
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            fontSize: isInfoOrTerminal ? '0.95rem' : '1.125rem',
            fontWeight: 500,
            whiteSpace: 'pre-line',
            display: 'flex',
            gap: 'var(--space-3)',
          }}>
            {isInfoOrTerminal && <span style={{ flexShrink: 0 }}>ℹ️</span>}
            {currentNode.text}
          </p>
        </div>

        {/* Options */}
        {options.length > 0 && (
          <div
            role="group"
            aria-label="Select your answer"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
          >
            {options.map((opt, i) => (
              <button
                key={`${currentId}-${opt.nextId}`}
                className="flow-option flow-reveal"
                onClick={() => handleOption(opt)}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span aria-hidden="true" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>›</span>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Terminal CTA */}
        {terminal && currentNode.ctaUrl && (
          <div className="flow-reveal" style={{ animationDelay: '100ms' }}>
            <a
              href={currentNode.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              aria-label={`${currentNode.ctaLabel} — opens in new tab`}
            >
              {currentNode.ctaLabel} →
            </a>
          </div>
        )}

        {/* Nav controls */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
          {history.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleBack} aria-label="Go back to previous question">
              ← {tFlow('back')}
            </button>
          )}
          {(terminal || history.length > 0) && (
            <button className="btn btn-ghost btn-sm" onClick={handleRestart} aria-label="Restart the flow from the beginning">
              ↺ {tFlow('startOver')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
