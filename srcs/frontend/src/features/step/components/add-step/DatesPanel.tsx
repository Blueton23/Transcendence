import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Text from "@/shared/ui/Text";
import { DatePicker } from "@/shared/ui/DatePicker";
import { type DateRange } from "@daypicker/react";
import { useRef } from "react";
import { useOnClickOutside } from "@/shared/hooks/useOnClickOutside";
import { useEscapeKey } from "@/shared/hooks/useEscapeKey";
import type { Travel } from "@/features/travel/types";

interface DatePanelProps {
  travel: Travel;
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  noOvernight: boolean;
  onNoOvernightChange: (checked: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export function DatesPanel({
  travel,
  selected,
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

  const disabled = [
    { before: new Date(travel.startDate) },
    { after: new Date(travel.endDate) },
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
        className="absolute right-0 z-10 mt-2 flex flex-col gap-4 p-6"
      >
        <DatePicker
          selected={selected}
          onSelect={handleDateSelect}
          singleDay={noOvernight}
          disabled={disabled}
          startMonth={new Date(travel.startDate)}
          endMonth={new Date(travel.endDate)}
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
        <Button onClick={onSubmit} variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Ajout..." : "Ajouter l'étape"}
        </Button>
        {error && <Text tone="accent">{error}</Text>}
      </Card>
    </div>
  );
}
