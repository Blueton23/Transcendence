import { toApiDateString } from "@/shared/utils/dates";
import { createTravel } from "@/features/travel/api/travelApi";
import type { Travel } from "@/features/travel/types";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import type { DateRange } from "@daypicker/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function useTravelForm({
  onCreated,
}: {
  onCreated: (data: Travel) => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dates, setDates] = useState<DateRange | undefined>(undefined);

  const { submit, isSubmitting, error } = useSubmitAction(async () => {
    if (!title.trim()) throw new Error(t("travel.errors.titleRequired"));
    if (!dates?.from || !dates?.to) {
      throw new Error(t("travel.errors.datesRequired"));
    }
    if (dates?.from === dates?.to) {
      throw new Error(
        "Sélectionne une date de fin différente de la date de début",
      );
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
