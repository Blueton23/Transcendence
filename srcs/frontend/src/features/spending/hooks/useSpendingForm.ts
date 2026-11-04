import { useState } from "react";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import type { Travel } from "@/features/travel/types";
import type {
  Spending,
  SpendingCategory,
  SpendingInput,
} from "@/features/spending/types";
import {
  createSpending,
  updateSpending,
} from "@/features/spending/api/spendingApi";
import { useAuth } from "@/features/auth/context/useAuth";
import type { Idea } from "@/features/idea/types";

interface UseSpendingFormProps {
  spending?: Spending;
  travel: Travel;
  onSuccess: () => void;
}

export function useSpendingForm({
  spending,
  travel,
  onSuccess,
}: UseSpendingFormProps) {
  const { currentUser } = useAuth();

  const [label, setLabel] = useState(spending?.label ?? "");
  const [amount, setAmount] = useState(spending?.amount ?? "");
  const [category, setCategory] = useState<SpendingCategory>(
    spending?.category ?? "o",
  );
  const [travelerId, setTravelerId] = useState(
    spending?.travelerId ?? currentUser?.id ?? 0,
  );
  const [stepId, setStepId] = useState<number | null>(spending?.stepId ?? null);
  const [ideaId, setIdeaId] = useState<number | null>(spending?.ideaId ?? null);
  const [sharedWith, setSharedWith] = useState<number[]>(
    spending
      ? spending.shares.map((s) => s.travelerId)
      : travel.travelers.map((t) => t.id),
  );
  const { submit, isSubmitting, error } = useSubmitAction(async () => {
    const data: SpendingInput = {
      travelerId: travelerId,
      category: category,
      label: label,
      amount: amount,
      paidDate: spending?.paidDate || null,
      stepId: stepId,
      ideaId: ideaId,
      sharedWith: sharedWith,
    };
    return spending
      ? updateSpending(travel.id, spending.id, data)
      : createSpending(travel.id, data);
  });

  const handleSubmit = async () => {
    const result = await submit();
    if (result.success) {
      onSuccess();
    }
  };

  const selectIdea = (idea: Idea | null) => {
    setIdeaId(idea?.id ?? null);
    if (idea && label === "") setLabel(idea.title);
  };

  const toggleShare = (travelerId: number) => {
    setSharedWith((current) =>
      current.includes(travelerId)
        ? current.filter((id) => id !== travelerId)
        : [...current, travelerId],
    );
  };

  return {
    label,
    setLabel,
    amount,
    setAmount,
    category,
    setCategory,
    travelerId,
    setTravelerId,
    stepId,
    setStepId,
    ideaId,
    selectIdea,
    sharedWith,
    toggleShare,
    handleSubmit,
    isSubmitting,
    error,
  };
}
