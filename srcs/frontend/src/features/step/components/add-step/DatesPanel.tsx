import Button from "@/shared/ui/Button"
import { DatePicker } from "@/shared/ui/DatePicker"
import { type DateRange} from "@daypicker/react";

interface DatePanelProps {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined ) => void;
}

export function DatesPanel({selected, onSelect} : DatePanelProps) {
  return (
    <div>
      <DatePicker selected={selected} onSelect={onSelect} />
      <label>
      <input type="checkbox"/>je ne passe pas de nuit ici
      </label>
      <Button variant="primary">Ajouter l'étape</Button>
    </div>
  );
}