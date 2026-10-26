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
  return (
    <div className="flex flex-col gap-6 md:min-h-0 md:flex-1 md:overflow-y-auto">
      <StepDetailHeader onBack={onBack} onModify={onModify} />

      <StepInfo step={step} dateLabel={dateLabel} />
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
