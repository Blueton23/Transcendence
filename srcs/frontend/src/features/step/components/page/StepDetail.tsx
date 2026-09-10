import type { Step } from "@/features/step/types";
import Divider from "@/shared/ui/Divider";
import type { Travel } from "@/features/travel/types";
import { computeNights } from "@/features/travel/utils/computeNights";
import { IdeaSection } from "@/features/step/components/detail/IdeaSection";
import { AccommodationSection } from "@/features/step/components/detail/AccommodationSection";
import { StepDetailHeader } from "@/features/step/components/detail/StepDetailHeader";
import { StepInfo } from "@/features/step/components/detail/StepInfo";

interface StepDetailProps {
  step: Step;
  dateLabel: string;
  travel: Travel;
  // ideas: Idea[];
  onBack: () => void;
}

//TODO(branchement): recuperer les Ideas + prepare les donnees pour Accomodation et IdeaSection
export function StepDetail({
  step,
  dateLabel,
  onBack,
  travel,
}: StepDetailProps) {
  const nights = computeNights(step.startDate, step.endDate);
  const hasNights = nights > 0;
  // const ideas = .... recuperer ici les idee du step

  return (
    <div className="flex flex-col gap-6">
      <StepDetailHeader onBack={onBack} />

      <StepInfo
        step={step}
        dateLabel={dateLabel}
        nights={nights}
        hasNights={hasNights}
      />
      <Divider />
      {hasNights && <AccommodationSection />}
      <IdeaSection step={step} travel={travel} />
    </div>
  );
}
