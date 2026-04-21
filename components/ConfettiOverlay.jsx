// ConfettiOverlay — pure CSS confetti, zero external libraries.
// 30 pieces with deterministic positions computed at module load (no Math.random per render).

'use client';

const COLORS = [
  '#ff6b35', '#fbbf24', '#22c55e', '#0ea5e9', '#8b5cf6',
  '#f0f4ff', '#ff8c5a', '#34d399', '#60a5fa', '#c084fc',
];

const PIECES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${(i * 3.37 + 1.5) % 100}%`,
  color: COLORS[i % COLORS.length],
  width: `${8 + (i % 5) * 2}px`,
  height: `${14 + (i % 4) * 3}px`,
  delay: `${(i * 0.09) % 1.4}s`,
  duration: `${1.6 + (i % 6) * 0.25}s`,
  borderRadius: i % 3 === 0 ? '50%' : '2px',
}));

export default function ConfettiOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        overflow: 'hidden',
      }}
    >
      {PIECES.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: '-20px',
            left: p.left,
            width: p.width,
            height: p.height,
            background: p.color,
            borderRadius: p.borderRadius,
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
