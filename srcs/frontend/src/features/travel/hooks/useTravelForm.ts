import { toApiDateString } from "@/shared/utils/dates";
import { createTravel, updateTravel } from "@/features/travel/api/travelApi";
import type { Travel } from "@/features/travel/types";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import type { DateRange } from "@daypicker/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export function useTravelForm({
  travel,
  onSuccess,
}: {
  travel?: Travel;
  onSuccess: (data: Travel) => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(travel?.title ?? "");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dates, setDates] = useState<DateRange | undefined>(
    travel
      ? { from: new Date(travel.startDate), to: new Date(travel.endDate) }
      : undefined,
  );

  const { submit, isSubmitting, error } = useSubmitAction(async () => {
    if (!title.trim()) throw new Error(t("travel.errors.titleRequired"));
    if (!dates?.from || !dates?.to) {
      throw new Error(t("travel.errors.datesRequired"));
    }
    if (dates?.from === dates?.to) {
      throw new Error(i18n.t("travel.errors.sameDates"));
    }
    const data = {
      title,
      startDate: toApiDateString(dates.from),
      endDate: toApiDateString(dates.to),
    };

    return travel ? updateTravel(travel.id, data) : createTravel(data);
  });

  const handleSubmit = async () => {
    const result = await submit();
    if (result.success && result.data) onSuccess(result.data);
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
