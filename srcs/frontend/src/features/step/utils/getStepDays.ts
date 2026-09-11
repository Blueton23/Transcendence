import type { Step } from "@/features/step/types";
import { formatDayLabel } from "@/features/step/utils/stepDates";

interface getStepDaysProps {
  step: Step;
  travelStartDate: string;
}

export function getStepDays({
  step,
  travelStartDate,
}: getStepDaysProps): string[] {
  const startStep = new Date(step.startDate);
  const endStep = new Date(step.endDate);
  const startTravel = new Date(travelStartDate);

  const days: string[] = [];

  const dayNumber =
    Math.round(
      (startStep.getTime() - startTravel.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;

  const currentDay = new Date(startStep);
  let currentDayNumber = dayNumber;

  while (currentDay <= endStep) {
    days.push(`JOUR ${currentDayNumber} · ${formatDayLabel(currentDay)}`);
    currentDay.setDate(currentDay.getDate() + 1);
    currentDayNumber++;
  }
  return days;
}
