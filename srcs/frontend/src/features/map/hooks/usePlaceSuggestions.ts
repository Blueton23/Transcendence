import { searchPlace } from "@/features/map/api/photonApi";
import type { Place } from "@/features/map/types";
import { useEffect, useState } from "react";

export function usePlaceSuggestions(query: string) {
  const [results, setResults] = useState<{ query: string; places: Place[] }>({
    query: "",
    places: [],
  });

  useEffect(() => {
    if (query.trim() === "") return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const places = await searchPlace(query);
      if (!cancelled) setResults({ query, places });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const isLoading = query.trim() !== "" && results.query !== query;
  return { suggestions: isLoading ? [] : results.places, isLoading };
}
