import { useState, useEffect } from "react";

export function useMediaQuery(query: string) {
  const [isMatch, setIsMatch] = useState(
    () => window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setIsMatch(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return isMatch;
}
