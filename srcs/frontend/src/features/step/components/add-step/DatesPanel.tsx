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
import { canEndOn, canStartOn } from "@/features/step/utils/stepAvailability";

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

  const startDateChosen =
    !noOvernight && !selected?.to ? selected?.from : undefined;
  const disabled = (date: Date) => {
    if (!startDateChosen) return !canStartOn(date, steps, travel, noOvernight);
    if (date.getTime() === startDateChosen.getTime()) return false;
    if (date < startDateChosen)
      return !canStartOn(date, steps, travel, noOvernight);
    return !canEndOn(date, startDateChosen, steps, travel);
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (noOvernight && range?.from) {
      onSelect({ from: range.from, to: range.from });
      return;
    }
    if (startDateChosen && range?.from && range.to) {
      if (range.from.getTime() === range.to.getTime()) {
        onSelect(undefined);
        return;
      }
      if (range.from < startDateChosen) {
        onSelect({ from: range.from, to: undefined });
        return;
      }
    }
    onSelect(range);
  };

  return (
    <div ref={cardRef}>
      <Card
        variant="default"
        className={`z-20 mt-2 flex flex-col gap-4 p-6 ${className}`}
      >
        <div className="flex justify-center">
          <div className="flex flex-col gap-2">
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
          </div>
        </div>
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
