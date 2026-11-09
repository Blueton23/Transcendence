import { useEffect, useState } from "react";

import type { User } from "@/features/auth/types";
import { searchFriend } from "../api/friendship";

type SearchResult = {
  query: string;
  travelers: User[];
  error: string | null;
};

export function useFriendSuggestions(query: string, enabled: boolean) {
  const [result, setResult] = useState<SearchResult | null>(null);

  const value = query.trim();
  const canSearch = enabled && value.length >= 2;
  const hasResult = canSearch && result?.query === value;

  useEffect(() => {
    if (!canSearch) return;

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await searchFriend(value);

        if (cancelled) return;

        setResult({
          query: value,
          travelers: response.travelers,
          error: null,
        });
      } catch {
        if (cancelled) return;

        setResult({
          query: value,
          travelers: [],
          error: err instanceof Error ? err.message : null,
        });
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [value, canSearch]);

  return {
    travelers: hasResult ? result.travelers : [],
    isSearching: canSearch && !hasResult,
    error: hasResult ? result.error : null,
  };
}
