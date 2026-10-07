import { getLeg } from "@/features/map/api/routingApi";
import type { LongLat, Route } from "@/features/map/types";
import type { Step } from "@/features/step/types";
import { useEffect, useState } from "react";

function coordinates(step: Step): LongLat {
  return [Number(step.longitude), Number(step.latitude)];
}

export function useRoute(steps: Step[]) {
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadRoute() {
      setIsLoading(true);
      setError(null);
      try {
        if (steps.length < 2) {
          if (!cancelled) setRoute(null);
          return;
        }
        // on cree les paires par trajet : [etape precedente, etape suivante]
        const pairs: [LongLat, LongLat][] = [];
        for (let i = 0; i < steps.length - 1; i++) {
          const from = coordinates(steps[i]);
          const to = coordinates(steps[i + 1]);
          pairs.push([from, to]);
        }
        // on fait un appel mapbox par paire, tus en parallele (grace au cache on evite les paires deja calculees)
        const legs = await Promise.all(
          pairs.map(([from, to]) => getLeg(from, to)),
        );
        // les trajets trouves sans les null poru les totaux et le trace
        const found = legs.filter((leg) => leg !== null);
        // si les etapes ont change pendant le calcul on ne va pas plus loin car ce resultat serait outdated
        if (!cancelled) {
          setRoute({
            totalDistanceKm: Math.round(
              found.reduce((sum, leg) => sum + leg.distanceKm, 0),
            ),
            totalDurationMinutes: found.reduce(
              (sum, leg) => sum + leg.durationMinutes,
              0,
            ),
            legs: legs.map(
              (leg) =>
                leg && {
                  distanceKm: leg.distanceKm,
                  durationMinutes: leg.durationMinutes,
                },
            ),
            // une ligne par trajet trouve pour dessiner le trace sur la carte
            geometry: {
              type: "MultiLineString",
              coordinates: found.map((leg) => leg.coordinates),
            },
          });
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erreur");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadRoute();
    return () => {
      cancelled = true;
    };
  }, [steps]);
  return { route, isLoading, error };
}
