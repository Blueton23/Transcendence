import type { IdeaActions, Step } from "@/features/step/types";
import Divider from "@/shared/ui/Divider";
import type { Travel } from "@/features/travel/types";
import { IdeaSection } from "@/features/step/components/detail/IdeaSection";
import { StepDetailHeader } from "@/features/step/components/detail/StepDetailHeader";
import { StepInfo } from "@/features/step/components/detail/StepInfo";
import type { Idea } from "@/features/idea/types";

interface StepDetailProps {
  step: Step;
  dateLabel: string;
  travel: Travel;
  ideas: Idea[];
  actions: IdeaActions;
  onAddLodging: (date: string) => void;
  onModify: () => void;
  onBack: () => void;
}

//TODO(branchement): recuperer les Ideas + prepare les donnees pour Accomodation et IdeaSection
export function StepDetail({
  step,
  dateLabel,
  onAddLodging,
  onModify,
  onBack,
  travel,
  ideas,
  actions,
}: StepDetailProps) {
  const hasNights = step.nights > 0;
  // const ideas = .... recuperer ici les idee du step

  return (
    <div className="flex flex-col gap-6">
      <StepDetailHeader onBack={onBack} onModify={onModify} />

      <StepInfo step={step} dateLabel={dateLabel} hasNights={hasNights} />
      <Divider />
      <IdeaSection
        step={step}
        travel={travel}
        ideas={ideas}
        actions={actions}
        onAddLodging={onAddLodging}
      />
    </div>
  );
}
