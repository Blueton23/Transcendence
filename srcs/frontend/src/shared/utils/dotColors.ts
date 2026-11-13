import type { SpendingCategory } from "@/features/spending/types";

export const dotColors: Record<SpendingCategory, string> = {
  l: "bg-cat-lodging-dot",
  m: "bg-cat-meal-dot",
  a: "bg-cat-activity-dot",
  f: "bg-cat-fuel-dot",
  t: "bg-cat-toll-dot",
  o: "bg-cat-other-dot",
};
