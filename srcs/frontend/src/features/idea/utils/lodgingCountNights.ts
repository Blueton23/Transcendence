import type { Idea } from "@/features/idea/types";
import i18n from "@/i18n";

export function lodgingCountNights(night: Idea): string {
  if (!night.arrivalDate || !night.departureDate) return "";
  const arrival = new Date(night.arrivalDate);
  const departure = new Date(night.departureDate);
  const nights =
    (departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24);
  return i18n.t("units.nights", { count: nights });
}
