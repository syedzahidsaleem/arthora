import { useEffect, useRef } from 'react';

/**
 * Custom polling hook invoking callback immediately and periodically while active.
 */
export function usePolling(
  fn: () => Promise<void> | void,
  intervalMs: number,
  active: boolean,
): void {
  const savedFn = useRef(fn);

  useEffect(() => {
    savedFn.current = fn;
  }, [fn]);

  useEffect(() => {
    if (!active) return;

    // Call immediately on activate
    void savedFn.current();

    const id = setInterval(() => {
      void savedFn.current();
    }, intervalMs);

    return () => {
      clearInterval(id);
    };
  }, [intervalMs, active]);
}
