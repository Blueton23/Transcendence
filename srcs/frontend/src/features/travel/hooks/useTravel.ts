import type { Travel } from "@/features/travel/types";
import { getTravel, getTravels } from "@/features/travel/api/travelApi";
import { useState, useEffect } from "react";
import i18n from "@/i18n";

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
        setError(err instanceof Error ? err.message : i18n.t("errors.generic"));
      } finally {
        setIsLoading(false);
      }
    }
    loadTravel();
  }, [travelId]);

  return { travel, isLoading, error };
}

export function useTravels() {
  const [travels, setTravels] = useState<Travel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    async function loadTravels() {
      setError(null);
      try {
        const result = await getTravels();
        setTravels(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : i18n.t("errors.generic"));
      } finally {
        setIsLoading(false);
      }
    }
    loadTravels();
  }, [refetchTrigger]);

  function refetch() {
    setRefetchTrigger((n) => n + 1);
  }

  return { travels, isLoading, error, refetch };
}
