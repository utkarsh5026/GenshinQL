import { RefObject, useEffect, useState } from 'react';

interface UseSharedIntersectionObserverOptions {
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
}

// Singleton observer instances keyed by config
const observerInstances = new Map<string, IntersectionObserver>();
const observedElements = new Map<
  Element,
  Set<(isIntersecting: boolean) => void>
>();

/**
 * Shared intersection observer hook that reuses observer instances
 * across multiple elements with the same configuration.
 *
 * This significantly reduces performance overhead when observing many elements.
 *
 * @returns boolean indicating if element is intersecting with viewport
 */
export function useSharedIntersectionObserver(
  elementRef: RefObject<Element>,
  options: UseSharedIntersectionObserverOptions = {}
): boolean {
  const { rootMargin = '200px', threshold = 0.01, enabled = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!enabled || !element) {
      return;
    }

    // Create a unique key for this observer configuration
    const observerKey = `${rootMargin}-${threshold}`;

    // Get or create shared observer for this configuration
    let observer = observerInstances.get(observerKey);

    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const callbacks = observedElements.get(entry.target);
            if (callbacks) {
              callbacks.forEach((callback) => callback(entry.isIntersecting));
            }
          });
        },
        {
          rootMargin,
          threshold,
        }
      );
      observerInstances.set(observerKey, observer);
    }

    // Register callback for this element
    if (!observedElements.has(element)) {
      observedElements.set(element, new Set());
    }
    observedElements.get(element)!.add(setIsIntersecting);

    // Start observing
    observer.observe(element);

    return () => {
      // Unregister callback
      const callbacks = observedElements.get(element);
      if (callbacks) {
        callbacks.delete(setIsIntersecting);

        // If no more callbacks for this element, stop observing it
        if (callbacks.size === 0) {
          observedElements.delete(element);
          observer?.unobserve(element);

          // Clean up observer if no elements are being observed
          if (observedElements.size === 0 && observer) {
            observer.disconnect();
            observerInstances.delete(observerKey);
          }
        }
      }
    };
  }, [elementRef, rootMargin, threshold, enabled]);

  return isIntersecting;
}
