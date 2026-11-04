import { useState, useEffect } from "react";
import i18n from "@/i18n";
import { type SpendingSummary, type Spending } from "@/features/spending/types";
import {
  getSpendings,
  getSpendingSummary,
} from "@/features/spending/api/spendingApi";

export function useSpendings(travelId: number) {
  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [summary, setSummary] = useState<SpendingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadSpendings() {
      if (!travelId) {
        setIsLoading(false);
        return;
      }
      setError(null);
      try {
        const [list, totals] = await Promise.all([
          getSpendings(travelId),
          getSpendingSummary(travelId),
        ]);
        if (ignore) return;
        setSpendings(list);
        setSummary(totals);
      } catch (err) {
        if (ignore) return;
        setError(err instanceof Error ? err.message : i18n.t("errors.generic"));
      }
      setIsLoading(false);
    }
    loadSpendings();
    return () => {
      ignore = true;
    };
  }, [travelId, refetchTrigger]);

  function refetch() {
    setRefetchTrigger((n) => n + 1);
  }

  return { spendings, summary, isLoading, error, refetch };
}
