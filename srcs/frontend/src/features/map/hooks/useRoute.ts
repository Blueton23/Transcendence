import { getRoute } from "@/features/map/api/routingApi";
import type { Route } from "@/features/map/types";
import type { Step } from "@/features/step/types";
import { useEffect, useState } from "react";

export function useRoute(steps: Step[]) {
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoute() {
      setIsLoading(true);
      setError(null);
      try {
        const result =
          steps.length < 2
            ? null
            : await getRoute(
                steps.map((s) => [Number(s.longitude), Number(s.latitude)]),
              );
        setRoute(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        setIsLoading(false);
      }
    }
    loadRoute();
  }, [steps]);
  return { route, isLoading, error };
}
