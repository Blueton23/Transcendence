import { DayPicker, type DateRange, type Matcher } from "@daypicker/react";
import "./DatePicker.css";
import { fr } from "@daypicker/react/locale";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface DatePickerProps {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  disabled?: Matcher | Matcher[];
  singleDay?: boolean;
  defaultMonth?: Date;
  startMonth?: Date;
  endMonth?: Date;
  markedDays?: Date[];
}

export function DatePicker({
  selected,
  onSelect,
  disabled,
  defaultMonth,
  startMonth,
  endMonth,
  markedDays,
  singleDay = false,
}: DatePickerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  if (singleDay) {
    return (
      <DayPicker
        locale={fr}
        mode="single"
        numberOfMonths={isDesktop ? 2 : 1}
        navLayout="around"
        selected={selected?.from}
        onSelect={(date) =>
          onSelect(date ? { from: date, to: date } : undefined)
        }
        disabled={disabled}
        defaultMonth={defaultMonth}
        startMonth={startMonth}
        endMonth={endMonth}
        modifiers={{ marked: markedDays }}
        modifiersClassNames={{ marked: "rdp-marked" }}
      />
    );
  }

  return (
    <DayPicker
      locale={fr}
      mode="range"
      resetOnSelect
      numberOfMonths={isDesktop ? 2 : 1}
      navLayout="around"
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      defaultMonth={defaultMonth}
      startMonth={startMonth}
      endMonth={endMonth}
      modifiers={{ marked: markedDays }}
      modifiersClassNames={{ marked: "rdp-marked" }}
    />
  );
}
