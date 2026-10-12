import { StepDateField } from "@/features/step/components/modal/StepDateField";
import {
  formatDateRange,
  toApiDateString,
} from "@/features/step/utils/stepDates";
import { createTravel } from "@/features/travel/api/travelApi";
import type { Travel } from "@/features/travel/types";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import Button from "@/shared/ui/Button";
import { DatePicker } from "@/shared/ui/DatePicker";
import Input from "@/shared/ui/Input";
import Text from "@/shared/ui/Text";
import type { DateRange } from "@daypicker/react";
import { useState } from "react";

interface FormScreenProps {
  onCreated: (travel: Travel) => void;
}

export function FormScreen({ onCreated }: FormScreenProps) {
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
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Text tone="secondary" className="font-semibold">
          Titre du voyage
        </Text>
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Titre de mon voyage"
        />
      </div>
      <StepDateField
        label={formatDateRange(dates)}
        onClick={() => setCalendarOpen((open) => !open)}
      />
      {calendarOpen && (
        <DatePicker
          selected={dates}
          onSelect={(range) => {
            setDates(range);
            if (range?.from && range?.to) setCalendarOpen(false);
          }}
        />
      )}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        type="submit"
        variant="primary"
        className="w-full"
      >
        {isSubmitting ? "Modifications en cours" : "Creer le voyage"}
      </Button>
      {error && <Text tone="accent">{error}</Text>}
    </div>
  );
}
