import type { SpendingSummary } from "@/features/spending/types";
import i18n from "@/i18n";

export function getPayer(summary: SpendingSummary | null, travelerId: number) {
  const payer = summary?.balances.find((b) => b.travelerId === travelerId);
  const name = payer?.name ?? "?";
  return {
    name: payer?.hasLeft ? `${name} (${i18n.t("spending.left")})` : name,
    initials: name?.slice(0, 2).toUpperCase() || "",
  };
}
