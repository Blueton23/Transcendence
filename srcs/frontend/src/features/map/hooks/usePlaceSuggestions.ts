import { searchPlace } from "@/features/map/api/mapboxApi";
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
      let places: Place[] = [];
      try {
        places = await searchPlace(query);
      } catch {
        //network off or Mapbox not available: list is empty
      }
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
