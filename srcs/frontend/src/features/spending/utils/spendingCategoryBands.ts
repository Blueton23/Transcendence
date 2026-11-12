import type { SpendingCategory } from "@/features/spending/types";

export const spendingCategoryBands: Record<SpendingCategory, string> = {
  l: "bg-cat-lodging-bg text-cat-lodging",
  m: "bg-cat-meal-bg text-cat-meal",
  a: "bg-cat-activity-bg text-cat-activity",
  f: "bg-cat-fuel-bg text-cat-fuel",
  t: "bg-cat-toll-bg text-cat-toll",
  o: "bg-cat-other-bg text-cat-other",
};
