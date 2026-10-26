import type { Idea } from "@/features/idea/types";
import type { Step } from "@/features/step/types";
import { toApiDateString } from "@/shared/utils/dates";

export interface Night {
  date: string;
  chosen: Idea | null;
  proposals: Idea[];
}

function nightsOf(step: Step): string[] {
  const nights: string[] = [];
  const day = new Date(step.startDate);
  const end = new Date(step.endDate);
  while (day < end) {
    nights.push(toApiDateString(day));
    day.setDate(day.getDate() + 1);
  }
  return nights;
}

export function lodgingsByNight(ideas: Idea[], step: Step): Night[] {
  const lodgings = ideas.filter(
    (idea) => idea.type === "accommodation" && idea.stepId === step.id,
  );

  return nightsOf(step).map((date) => {
    const covering = lodgings.filter(
      (l) =>
        l.arrivalDate !== null &&
        l.departureDate !== null &&
        l.arrivalDate <= date &&
        date < l.departureDate,
    );
    const chosen = covering.find((l) => l.status === "chosen") ?? null;
    return { date, chosen, proposals: chosen ? [] : covering };
  });
}
