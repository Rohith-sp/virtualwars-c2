'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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

function FormattedText({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const result = [];
  let currentList = null;

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('• ') || (trimmed.match(/^\d+\.\s/) && trimmed.length > 2);

    if (isBullet) {
      if (!currentList) {
        currentList = { type: trimmed.match(/^\d+\.\s/) ? 'ol' : 'ul', items: [] };
        result.push(currentList);
      }
      currentList.items.push(parseBold(trimmed.replace(/^[-•]|\d+\.\s/, '').trim()));
    } else {
      currentList = null;
      if (trimmed === '') {
        result.push(<div key={`br-${i}`} style={{ height: 'var(--space-2)' }} />);
      } else {
        result.push(<p key={i} style={{ margin: 0 }}>{parseBold(line)}</p>);
      }
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {result.map((item, i) => {
        if (item.type === 'ul') {
          return (
            <ul key={i} style={{ paddingLeft: 'var(--space-5)', margin: '4px 0', listStyle: 'disc' }}>
              {item.items.map((text, li) => <li key={li}>{text}</li>)}
            </ul>
          );
        }
        if (item.type === 'ol') {
          return (
            <ol key={i} style={{ paddingLeft: 'var(--space-5)', margin: '4px 0', listStyle: 'decimal' }}>
              {item.items.map((text, li) => <li key={li}>{text}</li>)}
            </ol>
          );
        }
        return <React.Fragment key={i}>{item}</React.Fragment>;
      })}
    </div>
  );
}

function parseBold(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 700, color: 'inherit' }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
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
      text: tChat('welcome'),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const logRef = useRef(null);
  const textareaRef = useRef(null);
  const sessionId = useRef(`session-${Date.now()}`);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Default to off as requested
  const recognitionRef = useRef(null);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speakText = useCallback((text) => {
    if (isMuted) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/^[•\-\*]\s+/gm, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      const targetLang = {
        en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN',
        ta: 'ta-IN', mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', pa: 'pa-IN'
      }[locale] || locale;

      utterance.lang = targetLang;

      // Find the best voice for the target language
      const voices = window.speechSynthesis.getVoices();
      
      // Filter voices by language code (e.g., 'hi-IN' or 'hi')
      const matchingVoices = voices.filter(v => 
        v.lang.toLowerCase() === targetLang.toLowerCase() || 
        v.lang.split('-')[0].toLowerCase() === targetLang.split('-')[0].toLowerCase()
      );

      if (matchingVoices.length > 0) {
        // Prefer a local voice if available, otherwise just pick the first match
        utterance.voice = matchingVoices.find(v => v.localService) || matchingVoices[0];
      }
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  }, [locale, isMuted]);

  const toggleRecording = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) || !('SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
        return;
      }
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    // Better locale mapping for recognition
    const recognitionLocales = {
      en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN',
      ta: 'ta-IN', mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', pa: 'pa-IN'
    };
    recognition.lang = recognitionLocales[locale] || locale;
    recognition.continuous = false;
    recognition.interimResults = true; // Show results as they come

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      if (event.results[0].isFinal) {
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
      }
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition', e);
      setIsRecording(false);
    }
  }, [isRecording, locale]);

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
    stopSpeaking();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    onClose();
  }, [onClose, stopSpeaking]);

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
          setError(tChat('rateLimit'));
          return;
        }
        if (res.status === 504) {
          setError(tChat('timeout'));
          return;
        }
        if (!res.ok) {
          setError(tChat('errorMessage'));
          return;
        }

        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
      } catch {
        setError(tChat('networkError'));
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, buildHistory, locale, tChat],
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
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(192, 57, 43, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(192, 57, 43, 0); }
          100% { box-shadow: 0 0 0 0 rgba(192, 57, 43, 0); }
        }
        .chat-dot { animation: dot-bounce 1s ease-in-out infinite; }
        .chat-dot:nth-child(2) { animation-delay: 0.15s; }
        .chat-dot:nth-child(3) { animation-delay: 0.3s; }
        .chat-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .chat-send-btn:not(:disabled):hover { opacity: 0.85; }
        .chat-close-btn:hover { color: var(--text-primary) !important; }
        .chat-textarea::-webkit-scrollbar { width: 4px; }
        .chat-textarea::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 4px; }
        .recording-pulse { animation: pulse-red 1.5s infinite; }
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
            {tChat('title')}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s',
              }}
              aria-label={isMuted ? "Unmute voice output" : "Mute voice output"}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <button
              onClick={handleClose}
              className="chat-close-btn"
              style={{
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
                <FormattedText text={msg.text} />
                {msg.role === 'assistant' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'var(--space-2)' }}>
                    <button
                      onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.text)}
                      disabled={isMuted && !isSpeaking}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isMuted && !isSpeaking ? 'var(--text-muted)' : 'var(--accent-blue)',
                        cursor: isMuted && !isSpeaking ? 'not-allowed' : 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      aria-label={isSpeaking ? "Stop reading" : "Read message aloud"}
                    >
                      {isSpeaking ? '⏹️ Stop' : '🔊 Listen'}
                    </button>
                  </div>
                )}
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
              type="button"
              onClick={toggleRecording}
              className={`btn ${isRecording ? 'btn-primary recording-pulse' : 'btn-outline'}`}
              aria-label="Toggle voice input"
              style={{
                flexShrink: 0,
                alignSelf: 'flex-end',
                width: 44,
                height: 44,
                padding: 0,
                borderRadius: 'var(--radius-md)',
                borderColor: isRecording ? 'transparent' : 'var(--border)',
                background: isRecording ? 'var(--accent-red)' : 'transparent',
                color: isRecording ? 'white' : 'var(--text-primary)'
              }}
            >
              🎤
            </button>
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
              {tChat('charsLeft', { count: charsLeft })}
            </div>
          )}
        </form>
      </div>
    </>
  );
}
