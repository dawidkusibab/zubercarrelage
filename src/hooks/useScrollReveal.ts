import { useEffect, useRef, useState } from 'react';

/**
 * Triggers a visibility state when the attached element enters the viewport.
 *
 * @param threshold  - 0–1 intersection ratio required before triggering. Default: 0.15
 * @param rootMargin - Margin around the root. Default: '0px'
 * @param once       - Animate only once and stop observing. Default: true
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15,
  rootMargin = '0px',
  once = true,
) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
}
