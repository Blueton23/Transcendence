import type { Step } from "@/features/step/types";
import { getSteps } from "@/features/step/api/stepApi";
import { useState, useEffect } from "react";
import i18n from "@/i18n";
import {
  useTravelEvent,
  useTravelSocketOpen,
} from "@/features/travel/realtime/useTravelSocket";

export function useSteps(travelId: number) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    // Live events can trigger several reloads in a row: keep the last one.
    let ignore = false;

    async function loadSteps() {
      if (!travelId) {
        setIsLoading(false);
        return;
      }
      setError(null);
      try {
        const result = await getSteps(travelId);
        if (!ignore) setSteps(result);
      } catch (err) {
        if (!ignore)
          setError(
            err instanceof Error ? err.message : i18n.t("errors.generic"),
          );
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadSteps();

    return () => {
      ignore = true;
    };
  }, [travelId, refetchTrigger]);

  function refetch() {
    setRefetchTrigger((n) => n + 1);
  }

  // Catches up on anything changed while the socket was closed.
  useTravelSocketOpen(refetch);

  // Each step shows how many ideas are pinned on it (ideaCount): reload the
  // steps when ideas move too. Votes do not change it.
  useTravelEvent("step.created", refetch);
  useTravelEvent("step.updated", refetch);
  useTravelEvent("step.deleted", refetch);
  useTravelEvent("idea.created", refetch);
  useTravelEvent("idea.updated", refetch);
  useTravelEvent("idea.deleted", refetch);

  return { steps, isLoading, error, refetch };
}
