import type { SpendingCategory } from "@/features/spending/types";

export const spendingCategoryLabels: Record<SpendingCategory, string> = {
  l: "spending.categories.lodging",
  f: "spending.categories.fuel",
  a: "spending.categories.activities",
  m: "spending.categories.meals",
  t: "spending.categories.tolls",
  o: "spending.categories.other",
};
