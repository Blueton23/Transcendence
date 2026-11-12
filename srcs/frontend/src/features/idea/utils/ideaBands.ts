import type { IdeaType } from "@/features/idea/types";

export const ideaBands: Record<IdeaType, string> = {
  restaurant: "bg-idea-restaurant-bg text-idea-restaurant",
  accommodation: "bg-idea-lodging-bg text-idea-lodging",
  activity: "bg-idea-activity-bg text-idea-activity",
  sightseeing: "bg-idea-sightseeing-bg text-idea-sightseeing",
};
