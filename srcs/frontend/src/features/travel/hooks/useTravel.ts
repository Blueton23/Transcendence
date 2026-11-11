import type { Travel } from "@/features/travel/types";
import { getTravel, getTravels } from "@/features/travel/api/travelApi";
import { useState, useEffect } from "react";
import {
  useTravelEvent,
  useTravelSocketOpen,
} from "@/features/travel/realtime/useTravelSocket";
import i18n from "@/i18n";
import { useError } from "@/shared/context/useError";

export function useTravel(travelId: number) {
  const [travel, setTravel] = useState<Travel>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useError();

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

  // Reloads in place (no loading state, so the page does not blank out).
  async function reloadTravel() {
    try {
      setTravel(await getTravel(travelId));
    } catch {
      showError(i18n.t("travel.errors.loadFailed"));
    }
  }

  // The travelers list changes when someone joins or leaves.
  useTravelSocketOpen(() => void reloadTravel());
  useTravelEvent("travel.updated", () => void reloadTravel());
  useTravelEvent("participant.joined", () => void reloadTravel());
  useTravelEvent("participant.left", () => void reloadTravel());
  useTravelEvent("participant.invited", () => void reloadTravel());
  useTravelEvent("participant.refused", () => void reloadTravel());

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
