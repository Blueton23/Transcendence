import { DayPicker, type DateRange, type Matcher } from "@daypicker/react";
import "./DatePicker.css";
import { fr } from "@daypicker/react/locale";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface DatePickerProps {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  disabled?: Matcher | Matcher[];
}

export function DatePicker({ selected, onSelect, disabled }: DatePickerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <DayPicker
      locale={fr}
      mode="range"
      numberOfMonths={isDesktop ? 2 : 1}
      navLayout="around"
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
    />
  );
}
