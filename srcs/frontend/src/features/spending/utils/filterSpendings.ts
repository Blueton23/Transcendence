import type { StepFilter } from "@/features/idea/types";
import type { Spending, SpendingFilter } from "@/features/spending/types";

export function filterSpendings(
  spending: Spending[],
  category: SpendingFilter,
  step: StepFilter,
) {
  return spending.filter(
    (s) =>
      (category === "all" || s.category === category) &&
      (step === "all" ||
        (step === "none" ? s.stepId === null : s.stepId === step)),
  );
}
