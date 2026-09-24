import type { Step } from "@/features/step/types";
import { toApiDateString } from "@/features/step/utils/stepDates";
import type { Travel } from "@/features/travel/types";

export function canStartOn(
  day: Date,
  steps: Step[],
  travel: Travel,
  noOvernight: boolean,
) {
  const d = toApiDateString(day);
  if (d < travel.startDate) return false;
  if (noOvernight) {
    return (
      d <= travel.endDate &&
      !steps.some((s) => s.startDate < d && d < s.endDate)
    );
  }
  return (
    d < travel.endDate && !steps.some((s) => s.startDate <= d && d < s.endDate)
  );
}

export function canEndOn(
  day: Date,
  start: Date,
  steps: Step[],
  travel: Travel,
) {
  const s = toApiDateString(start);
  const e = toApiDateString(day);
  if (e <= s || e > travel.endDate) return false;
  return steps.every((o) => o.endDate <= s || e <= o.startDate);
}
