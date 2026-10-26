import type { Step } from "@/features/step/types";
import { formatDayLabel } from "@/features/step/utils/stepDates";
import { toApiDateString } from "@/shared/utils/dates";

interface getStepDaysProps {
  step: Step;
}

export interface Day {
  date: string;
  label: string;
}

export function getStepDays({ step }: getStepDaysProps): Day[] {
  const startStep = new Date(step.startDate);
  const endStep = new Date(step.endDate);

  const days: Day[] = [];

  const currentDay = new Date(startStep);

  while (currentDay <= endStep) {
    days.push({
      date: toApiDateString(currentDay),
      label: formatDayLabel(currentDay),
    });
    currentDay.setDate(currentDay.getDate() + 1);
  }
  return days;
}
