'use client';

import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.querySelectorAll('.reveal').forEach((el) => {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add a small staggered delay based on the DOM order if they appear together
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1,
      }
    );

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el, i) => {
      // Stagger siblings horizontally or vertically
      el.style.transitionDelay = `${(i % 5) * 80}ms`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}
