import { type SpendingSummary } from "@/features/spending/types";
import type { Travel } from "@/features/travel/types";
import i18n from "@/i18n";
import { getAvatarColor } from "@/shared/utils/getAvatarColors";

export function getPayer(
  travel: Travel,
  summary: SpendingSummary | null,
  travelerId: number,
) {
  const payer = summary?.balances.find((b) => b.travelerId === travelerId);
  const name = payer?.name ?? "?";
  return {
    name: payer?.hasLeft ? `${name} (${i18n.t("spending.left")})` : name,
    initials: name?.slice(0, 2).toUpperCase() || "",
    color: getAvatarColor(travel.travelers, travelerId),
  };
}
