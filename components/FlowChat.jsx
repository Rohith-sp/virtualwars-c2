'use client';

import { useState, useMemo } from 'react';
import flows from '@/data/flows.json';
import { buildIndex, getNode, getOptions, isTerminal } from '@/lib/flowEngine';
import { trackEvent, GA_EVENTS } from '@/lib/analytics';

export default function FlowChat({ initialNodeId = 'root', onFormNavigate }) {
  // Build index once on mount — O(1) lookups from here on
  const flowIndex = useMemo(() => {
    trackEvent(GA_EVENTS.FLOW_STARTED, { node_id: initialNodeId });
    return buildIndex(flows);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [currentId, setCurrentId] = useState(initialNodeId);
  const [history, setHistory] = useState([]);

  const currentNode = getNode(flowIndex, currentId);
  const options = getOptions(currentNode);
  const terminal = isTerminal(currentNode);

  const handleOption = (option) => {
    setHistory((h) => [...h, currentId]);
    setCurrentId(option.nextId);
    if (isTerminal(getNode(flowIndex, option.nextId))) {
      trackEvent(GA_EVENTS.FLOW_COMPLETED, { terminal_node: option.nextId });
    }
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentId(prev);
  };

  const handleRestart = () => {
    setHistory([]);
    setCurrentId(initialNodeId);
    trackEvent(GA_EVENTS.FLOW_STARTED, { node_id: initialNodeId });
  };

  if (!currentNode) {
    return (
      <div className="card-glass" style={{ padding: 'var(--space-6)' }}>
        <p style={{ color: 'var(--color-danger)' }}>Error: flow node not found.</p>
      </div>
    );
  }

  const nodeTypeColor = {
    question: 'var(--color-primary)',
    info: 'var(--color-secondary)',
    terminal: 'var(--color-success)',
  };

  return (
    <div
      className="card-glass"
      style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
    >
      {/* Type badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: nodeTypeColor[currentNode.type] ?? 'var(--text-muted)',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
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
        style={{
          background: 'var(--bg-surface-2)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-5)',
          borderLeft: `3px solid ${nodeTypeColor[currentNode.type] ?? 'var(--border-subtle)'}`,
        }}
      >
        <p style={{ color: 'var(--text-primary)', lineHeight: 1.75, fontSize: '0.9375rem', whiteSpace: 'pre-line' }}>
          {currentNode.text}
        </p>
      </div>

      {/* Options — real <button> elements, keyboard navigable */}
      {options.length > 0 && (
        <div
          role="group"
          aria-label="Select your answer"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
        >
          {options.map((opt) => (
            <button
              key={opt.nextId}
              className="btn btn-ghost"
              onClick={() => handleOption(opt)}
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              <span aria-hidden="true" style={{ color: 'var(--color-primary)', flexShrink: 0 }}>›</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Terminal CTA */}
      {terminal && currentNode.ctaUrl && (
        <a
          href={currentNode.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          aria-label={`${currentNode.ctaLabel} — opens in new tab`}
        >
          {currentNode.ctaLabel} →
        </a>
      )}

      {/* Nav controls */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {history.length > 0 && (
          <button className="btn btn-outline btn-sm" onClick={handleBack} aria-label="Go back to previous question">
            ← Back
          </button>
        )}
        {(terminal || history.length > 0) && (
          <button className="btn btn-outline btn-sm" onClick={handleRestart} aria-label="Restart the flow from the beginning">
            ↺ Restart
          </button>
        )}
      </div>
    </div>
  );
}
