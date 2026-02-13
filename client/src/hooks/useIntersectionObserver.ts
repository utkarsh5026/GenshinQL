import { RefObject, useEffect, useState } from 'react';

interface UseIntersectionObserverOptions {
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
}

/**
 * Hook to detect when an element enters or exits the viewport
 * Useful for lazy loading images and other content
 *
 * @returns boolean indicating if element is intersecting with viewport
 */
export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): boolean {
  const { rootMargin = '200px', threshold = 0.01, enabled = true } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!enabled || !element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [elementRef, rootMargin, threshold, enabled]);

  return isIntersecting;
}
