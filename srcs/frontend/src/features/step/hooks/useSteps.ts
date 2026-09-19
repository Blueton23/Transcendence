import type { Step } from "@/features/step/types";
import { getSteps } from "@/features/step/api/stepApi";
import { useState, useEffect } from "react";

export function useSteps(travelId: number) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    async function loadSteps() {
      setError(null);
      try {
        const result = await getSteps(travelId);
        setSteps(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setIsLoading(false);
      }
    }
    loadSteps();
  }, [travelId, refetchTrigger]);

  function refetch() {
    setRefetchTrigger((n) => n + 1);
  }

  return { steps, isLoading, error, refetch };
}
