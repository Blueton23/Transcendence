import type { Travel } from "@/features/travel/types";
import i18n from "@/i18n";

export function getStatus(travel: Travel): string {
  const today = new Date();
  const startDate = new Date(travel.startDate);
  const endDate = new Date(travel.endDate);
  if (today >= startDate && today <= endDate)
    return i18n.t("travel.status.ongoing");
  if (today > endDate) return i18n.t("travel.status.finished");
  const daysleft = Math.round(
    (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  return i18n.t("travel.status.startsIn", { count: daysleft });
}
