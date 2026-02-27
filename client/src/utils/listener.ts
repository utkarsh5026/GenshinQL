/**
 * Add multiple event listeners to an element
 * @param el - The element to attach listeners to
 * @param events - Object mapping event names to handlers
 * @returns Cleanup function to remove all listeners
 */
export function addListeners<T extends HTMLElement | Document>(
  el: T | null,
  events: {
    [K in keyof HTMLElementEventMap]?: (e: HTMLElementEventMap[K]) => void;
  }
): () => void {
  if (!el) return () => {};

  const entries = Object.entries(events) as [
    keyof HTMLElementEventMap,
    EventListener,
  ][];

  entries.forEach(([event, handler]) => {
    el.addEventListener(event, handler as EventListener);
  });

  return () => {
    entries.forEach(([event, handler]) => {
      el.removeEventListener(event, handler as EventListener);
    });
  };
}
