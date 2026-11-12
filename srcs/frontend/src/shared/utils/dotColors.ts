import type { IdeaType } from "@/features/idea/types";
import type { SpendingCategory } from "@/features/spending/types";

export const dotColors: Record<IdeaType | SpendingCategory, string> = {
  restaurant: "bg-idea-restaurant-dot",
  accommodation: "bg-idea-lodging-dot",
  activity: "bg-idea-activity-dot",
  sightseeing: "bg-idea-sightseeing-dot",
  l: "bg-cat-lodging-dot",
  m: "bg-cat-meal-dot",
  a: "bg-cat-activity-dot",
  f: "bg-cat-fuel-dot",
  t: "bg-cat-toll-dot",
  o: "bg-cat-other-dot",
};
