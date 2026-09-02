import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { DatePicker } from "@/shared/ui/DatePicker";
import { type DateRange } from "@daypicker/react";
import { useRef } from "react";
import { useOnClickOutside } from "@/shared/hooks/useOnClickOutside";
import { useEscapeKey } from "@/shared/hooks/useEscapeKey";

interface DatePanelProps {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  noOvernight: boolean;
  onNoOvernightChange: (checked: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function DatesPanel({
  selected,
  onSelect,
  noOvernight,
  onNoOvernightChange,
  onSubmit,
  onClose,
}: DatePanelProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(cardRef, onClose);
  useEscapeKey(onClose);
  return (
    <div ref={cardRef}>
      <Card
        variant="default"
        className="absolute right-0 z-10 mt-2 flex flex-col gap-4 p-6"
      >
        <DatePicker
          selected={selected}
          onSelect={onSelect}
          disabled={[noOvernight, { before: new Date() }]}
          // TODO(branchement): borner aussi aux dates du voyage (travel.startDate/endDate) une fois Travel branché
          // TODO(branchement): exclure les dates déjà prises par d'autres étapes (sauf étapes "pas de nuit")
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
        <Button onClick={onSubmit} variant="primary">
          Ajouter l'étape
        </Button>
      </Card>
    </div>
  );
}
