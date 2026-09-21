import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Text from "@/shared/ui/Text";
import { DatePicker } from "@/shared/ui/DatePicker";
import { type DateRange } from "@daypicker/react";
import { useRef } from "react";
import { useOnClickOutside } from "@/shared/hooks/useOnClickOutside";
import { useEscapeKey } from "@/shared/hooks/useEscapeKey";
import type { Travel } from "@/features/travel/types";
import type { Step } from "@/features/step/types";

interface DatePanelProps {
  steps: Step[];
  travel: Travel;
  selected: DateRange | undefined;
  className?: string;
  onSelect: (range: DateRange | undefined) => void;
  noOvernight: boolean;
  onNoOvernightChange: (checked: boolean) => void;
  onClose: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function DatesPanel({
  steps,
  travel,
  selected,
  className = "absolute right-0",
  onSelect,
  noOvernight,
  onNoOvernightChange,
  onSubmit,
  onClose,
  isSubmitting,
  error,
}: DatePanelProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(cardRef, onClose);
  useEscapeKey(onClose);

  const noNightDays = steps
    .filter((steps) => steps.startDate === steps.endDate)
    .map((step) => new Date(step.startDate));
  const takenDates = steps
    .filter((step) => step.startDate !== step.endDate)
    .map((step) => ({
      after: new Date(step.startDate),
      before: new Date(step.endDate),
    }));

  const disabled = [
    { before: new Date(travel.startDate) },
    { after: new Date(travel.endDate) },
    ...takenDates,
  ];

  const handleDateSelect = (range: DateRange | undefined) => {
    if (noOvernight && range?.from) {
      onSelect({ from: range.from, to: range.from });
    } else {
      onSelect(range);
    }
  };

  return (
    <div ref={cardRef}>
      <Card
        variant="default"
        className={`z-10 mt-2 flex flex-col gap-4 p-6 ${className}`}
      >
        <DatePicker
          selected={selected}
          onSelect={handleDateSelect}
          singleDay={noOvernight}
          disabled={disabled}
          startMonth={new Date(travel.startDate)}
          endMonth={new Date(travel.endDate)}
          markedDays={noNightDays}
        />
        <label className="flex items-center gap-2 font-sans text-md font-semibold">
          <input
            type="checkbox"
            checked={noOvernight}
            onChange={(event) => onNoOvernightChange(event.target.checked)}
            className="h-4 w-4 accent-brand-primary"
          />{" "}
          je ne passe pas de nuit ici
        </label>
        {onSubmit && (
          <Button onClick={onSubmit} variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Ajout..." : "Ajouter l'étape"}
          </Button>
        )}
        {error && <Text tone="accent">{error}</Text>}
      </Card>
    </div>
  );
}
