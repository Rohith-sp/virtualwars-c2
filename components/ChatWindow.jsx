'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { trackEvent, GA_EVENTS } from '@/lib/analytics';

const MAX_CHARS = 500;
const MAX_HISTORY_TURNS = 6;

function sanitize(str) {
  return String(str).trim().slice(0, MAX_CHARS);
}

function autoResize(el) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
}

export default function ChatWindow({ onClose }) {
  const tChat = useTranslations('chat');
  const locale = useLocale();

  const starterChips = [
    tChat('suggestedQuestions.register'),
    tChat('suggestedQuestions.counting'),
    tChat('suggestedQuestions.mcc'),
  ];

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! Ask me anything about voting in India — registration, lost ID, NOTA, or election day rules.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const logRef = useRef(null);
  const textareaRef = useRef(null);
  const sessionId = useRef(`session-${Date.now()}`);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    autoResize(textareaRef.current);
  }, [input]);

  const displayMessages = useMemo(
    () => messages.map((m, i) => ({ ...m, key: `${m.role}-${i}` })),
    [messages],
  );

  const buildHistory = useCallback(
    (currentMessages) =>
      currentMessages
        .slice(-MAX_HISTORY_TURNS * 2)
        .map(({ role, text }) => ({ role, content: text })),
    [],
  );

  const handleClose = useCallback(() => {
    setError('');
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(
    async (e, predefinedQuestion = null) => {
      if (e?.preventDefault) e.preventDefault();
      const question = sanitize(predefinedQuestion || input);
      if (!question || loading) return;

      setInput('');
      setError('');

      const nextMessages = [...messages, { role: 'user', text: question }];
      setMessages(nextMessages);
      setLoading(true);

      trackEvent(GA_EVENTS.AI_QUESTION_ASKED, {
        question_length: question.length,
        session_id: sessionId.current,
        turn_count: nextMessages.length,
      });

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            history: buildHistory(nextMessages),
            session_id: sessionId.current,
            locale,
          }),
        });

        if (res.status === 429) {
          setError('Rate limit reached. Please wait a minute before asking again.');
          return;
        }
        if (res.status === 504) {
          setError('The AI is taking too long right now. Please try again in a moment.');
          return;
        }
        if (!res.ok) {
          setError(tChat('errorMessage'));
          return;
        }

        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
      } catch {
        setError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, buildHistory],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit],
  );

  const handleInputChange = useCallback((e) => {
    setInput(e.target.value);
  }, []);

  const charsLeft = MAX_CHARS - input.length;
  const isNearLimit = charsLeft < 60;

  return (
    <>
      <style>{`
        @keyframes dot-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .chat-dot { animation: dot-bounce 1s ease-in-out infinite; }
        .chat-dot:nth-child(2) { animation-delay: 0.15s; }
        .chat-dot:nth-child(3) { animation-delay: 0.3s; }
        .chat-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .chat-send-btn:not(:disabled):hover { opacity: 0.85; }
        .chat-close-btn:hover { color: var(--text-primary) !important; }
        .chat-textarea::-webkit-scrollbar { width: 4px; }
        .chat-textarea::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 4px; }
      `}</style>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          background: 'var(--bg-base)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            flexShrink: 0,
            background: 'var(--bg-surface)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--accent-blue-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              color: 'var(--accent-blue)',
            }}
            aria-hidden="true"
          >
            🗳️
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
            AI Election Assistant
          </span>
          <button
            onClick={handleClose}
            className="chat-close-btn"
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.25rem',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '2px 4px',
              borderRadius: 4,
              transition: 'color 0.15s',
            }}
            aria-label="Close AI chat"
          >
            ✕
          </button>
        </div>

        {/* ── Message log ── */}
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label="Chat messages"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-4) var(--space-5)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          {displayMessages.map((msg) => (
            <div
              key={msg.key}
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'flex-start',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.role === 'assistant' && (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--accent-blue-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                  aria-hidden="true"
                >
                  🗳️
                </div>
              )}
              <div
                style={{
                  maxWidth: msg.role === 'user' ? '75%' : '80%',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius:
                    msg.role === 'user'
                      ? '16px 16px 4px 16px'
                      : '16px 16px 16px 4px',
                  background:
                    msg.role === 'user' ? 'var(--accent-saffron)' : 'var(--bg-surface)',
                  color:
                    msg.role === 'user' ? 'var(--text-inverse)' : 'var(--text-primary)',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  borderLeft: msg.role === 'assistant' ? '3px solid var(--accent-blue)' : 'none',
                  fontSize: '0.875rem',
                  lineHeight: 1.65,
                  wordBreak: 'break-word',
                  boxShadow: msg.role === 'user' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Starter Chips */}
          {messages.length === 1 && !loading && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
              {starterChips.map(chip => (
                <button
                  key={chip}
                  onClick={(e) => handleSubmit(e, chip)}
                  style={{
                    background: 'var(--accent-blue-light)',
                    color: 'var(--accent-blue)',
                    border: '1px solid var(--accent-blue)',
                    borderRadius: 'var(--radius-pill)',
                    padding: 'var(--space-2) var(--space-3)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-blue)'; e.currentTarget.style.color = 'var(--text-inverse)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-blue-light)'; e.currentTarget.style.color = 'var(--accent-blue)'; }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--accent-blue-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
                aria-hidden="true"
              >
                🗳️
              </div>
              <div
                aria-label="Assistant is typing"
                style={{
                  display: 'flex',
                  gap: 5,
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderLeft: '3px solid var(--accent-blue)',
                  borderRadius: '16px 16px 16px 4px',
                  alignItems: 'center',
                  height: '42px',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="chat-dot"
                    aria-hidden="true"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--accent-blue)',
                      display: 'block',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              role="alert"
              style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'rgba(192,57,43,0.08)',
                border: '1px solid rgba(192,57,43,0.25)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                color: 'var(--accent-red)',
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* ── Input row ── */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            flexShrink: 0,
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
            <textarea
              ref={textareaRef}
              id="chat-input"
              className="input chat-textarea"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={tChat('placeholder')}
              rows={1}
              aria-label="Type your election question"
              style={{
                resize: 'none',
                flex: 1,
                lineHeight: 1.5,
                overflowY: 'auto',
                minHeight: 44,
                maxHeight: 140,
                borderRadius: 'var(--radius-md)',
              }}
              maxLength={MAX_CHARS}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary chat-send-btn"
              disabled={!input.trim() || loading}
              aria-label={tChat('send')}
              style={{ 
                flexShrink: 0, 
                alignSelf: 'flex-end', 
                width: 44, 
                height: 44, 
                padding: 0,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>

          {/* Character counter — only visible near limit */}
          {isNearLimit && (
            <div
              aria-live="polite"
              style={{
                fontSize: '0.75rem',
                color: charsLeft < 20 ? 'var(--accent-red)' : 'var(--text-muted)',
                textAlign: 'right',
                paddingRight: 2,
              }}
            >
              {charsLeft} characters left
            </div>
          )}
        </form>
      </div>
    </>
  );
}
