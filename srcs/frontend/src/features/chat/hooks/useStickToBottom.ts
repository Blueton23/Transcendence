import { useCallback, useLayoutEffect, useRef } from "react";

const NEAR_BOTTOM_PX = 80;

// Keeps a scroll container pinned to the bottom when new content arrives,
// unless the user scrolled up to read older messages.
export function useStickToBottom<T extends HTMLElement>(deps: unknown[]) {
  const containerRef = useRef<T>(null);
  const stuck = useRef(true);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    stuck.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
  }, []);

  // Call before adding content that must be shown (e.g. the user's own
  // message), even when scrolled up.
  const stick = useCallback(() => {
    stuck.current = true;
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el && stuck.current) el.scrollTop = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { containerRef, onScroll, stick };
}
