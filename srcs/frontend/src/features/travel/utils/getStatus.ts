import type { Travel } from "@/features/travel/types";

export function getStatus(travel: Travel): string {
  const today = new Date();
  const startDate = new Date(travel.startDate);
  const endDate = new Date(travel.endDate);
  if (today >= startDate && today <= endDate) return "EN COURS";
  if (today > endDate) return "TERMINE";
  const daysleft = Math.round(
    (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysleft === 1) return "Dans 1 jour";
  return `Dans ${daysleft} jours`;
}
