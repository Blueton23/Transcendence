import { useEffect, useRef, useState } from "react";

import type { User } from "@/features/auth/types";
import { searchFriend } from "../api/friendship";

export function useFriendSuggestions(query: string, enabled: boolean) {
  const [travelers, setTravelers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const value = query.trim();
    const currentRequest = ++requestId.current;

    if (!enabled || value.length < 2) {
      setTravelers([]);
      setIsSearching(false);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await searchFriend(value);

        if (currentRequest !== requestId.current) return;

        setTravelers(result.travelers);
      } catch {
        if (currentRequest !== requestId.current) return;

        setTravelers([]);
        setError("Impossible de rechercher les utilisateurs.");
      } finally {
        if (currentRequest === requestId.current) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [query, enabled]);

  return { travelers, isSearching, error };
}
