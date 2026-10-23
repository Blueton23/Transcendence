import type { Idea } from "@/features/idea/types";

export function lodgingCountNights(night: Idea): string {
  if (!night.arrivalDate || !night.departureDate) return "";
  const arrival = new Date(night.arrivalDate);
  const departure = new Date(night.departureDate);
  const nights =
    (departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24);
  return nights === 1 ? `${nights} nuit` : `${nights} nuits`;
}
