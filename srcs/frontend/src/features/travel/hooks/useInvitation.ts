import { getInvitation } from "@/features/travel/api/travelApi";
import type { Invitation } from "@/features/travel/types";
import i18n from "@/i18n";
import { useEffect, useState } from "react";

export function useInvitation(token: string) {
  const [travel, setTravel] = useState<Invitation | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvitation() {
      setError(null);
      try {
        const result = await getInvitation(token);
        setTravel(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : i18n.t("step.errors.generic"),
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadInvitation();
  }, [token]);

  return { travel, isLoading, error };
}
