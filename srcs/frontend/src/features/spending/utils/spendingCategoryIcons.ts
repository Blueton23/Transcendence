import type { SpendingCategory } from "@/features/spending/types";
import type { IconName } from "@/shared/ui/Icon";

export const spendingCategoryIcons: Record<SpendingCategory, IconName> = {
  l: "bed",
  f: "car",
  a: "mtn",
  m: "fork",
  t: "route",
  o: "cash",
};
