// SkipLink — visually hidden until focused; first child of <body>.
// Pure Server Component: no hooks needed.

export default function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  );
}
