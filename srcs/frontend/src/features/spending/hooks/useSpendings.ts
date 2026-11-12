import { useState, useEffect } from "react";
import { type SpendingSummary, type Spending } from "@/features/spending/types";
import {
  getSpendings,
  getSpendingSummary,
} from "@/features/spending/api/spendingApi";
import {
  useTravelEvent,
  useTravelSocketOpen,
} from "@/features/travel/realtime/useTravelSocket";
import { toErrorMessage } from "@/shared/api/errors";

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
        setError(toErrorMessage(err));
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

  useTravelSocketOpen(refetch);

  useTravelEvent("spending.created", refetch);
  useTravelEvent("spending.updated", refetch);
  useTravelEvent("spending.deleted", refetch);
  useTravelEvent("participant.joined", refetch);
  useTravelEvent("participant.left", refetch);

  return { spendings, summary, isLoading, error, refetch };
}
