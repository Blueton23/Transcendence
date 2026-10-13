import { toApiDateString } from "@/features/step/utils/stepDates";
import { createTravel } from "@/features/travel/api/travelApi";
import type { Travel } from "@/features/travel/types";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import type { DateRange } from "@daypicker/react";
import { useState } from "react";

export function useTravelForm({
  onCreated,
}: {
  onCreated: (data: Travel) => void;
}) {
  const [title, setTitle] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dates, setDates] = useState<DateRange | undefined>(undefined);

  const { submit, isSubmitting, error } = useSubmitAction(async () => {
    if (!title.trim()) throw new Error("Indique un titre avant de valider");
    if (!dates?.from || !dates?.to) {
      throw new Error("Selectionne des dates avant de valider");
    }
    return createTravel({
      title,
      startDate: toApiDateString(dates.from),
      endDate: toApiDateString(dates.to),
    });
  });

  const handleSubmit = async () => {
    const result = await submit();
    if (result.success && result.data) onCreated(result.data);
  };
  return {
    title,
    setTitle,
    calendarOpen,
    setCalendarOpen,
    dates,
    setDates,
    isSubmitting,
    error,
    handleSubmit,
  };
}
