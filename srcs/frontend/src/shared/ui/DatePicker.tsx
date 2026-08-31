import { useState } from "react";
import { DayPicker, type DateRange } from "@daypicker/react";
import "./DatePicker.css";
import { fr } from "@daypicker/react/locale";
import { useMediaQuery } from "../hooks/useMediaQuery";

export function DatePicker() {
  const [selected, setSelected] = useState<DateRange>();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <DayPicker
      locale={fr}
      animate
      mode="range"
      numberOfMonths={isDesktop ? 2 : 1}
      navLayout="around"
      selected={selected}
      onSelect={setSelected}
    />
  );
}
