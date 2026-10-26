import { DayPicker, type DateRange, type Matcher } from "@daypicker/react";
import "./DatePicker.css";
import { fr, es, enGB } from "@daypicker/react/locale";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useTranslation } from "react-i18next";

const calendarLocales = { fr, en: enGB, es } as const;

interface DatePickerProps {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  disabled?: Matcher | Matcher[];
  singleDay?: boolean;
  defaultMonth?: Date;
  startMonth?: Date;
  endMonth?: Date;
  markedDays?: Date[];
  numberOfMonths?: 1 | 2;
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
  numberOfMonths,
}: DatePickerProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { i18n } = useTranslation();
  const locale =
    calendarLocales[i18n.resolvedLanguage as keyof typeof calendarLocales] ??
    fr;
  if (singleDay) {
    return (
      <DayPicker
        locale={locale}
        mode="single"
        numberOfMonths={numberOfMonths ?? (isDesktop ? 2 : 1)}
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
      locale={locale}
      mode="range"
      resetOnSelect
      numberOfMonths={numberOfMonths ?? (isDesktop ? 2 : 1)}
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
