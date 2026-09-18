import type { Travel } from "@/features/travel/types";
import { getTravel } from "@/features/travel/api/travelApi";
import { useState, useEffect } from "react";

export function useTravel(travelId: number) {
  const [travel, setTravel] = useState<Travel>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTravel() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getTravel(travelId);
        setTravel(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setIsLoading(false);
      }
    }
    loadTravel();
  }, [travelId]);

  return { travel, isLoading, error };
}
