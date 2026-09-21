import type { Segment } from "@/features/step/api/segmentApi";
import type { Step } from "@/features/step/types";
import { ItineraryTimeline } from "@/features/step/components/timeline/ItineraryTimeline";
import { TotalSegment } from "../timeline/TotalSegment";
import { AddStepForm } from "@/features/step/components/add-step";
import type { Travel } from "@/features/travel/types";
import { useState } from "react";
import IconButton from "@/shared/ui/IconButton";
import Icon from "@/shared/ui/Icon";
import Text from "@/shared/ui/Text";
import { StepFormModal } from "@/features/step/components/modal/StepFormModal";

interface ItineraryListPanelProps {
  steps: Step[];
  segments: Segment[];
  travel: Travel;
  dateLabels: string[];
  onDetailView: (step: Step) => void;
  onModifyStep: (step: Step) => void;
  refetch: () => void;
}

export function ItineraryListPanel({
  steps,
  segments,
  travel,
  dateLabels,
  onDetailView,
  onModifyStep,
  refetch,
}: ItineraryListPanelProps) {
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  return (
    <>
      <div className="hidden md:block">
        <AddStepForm steps={steps} travel={travel} refetch={refetch} />
      </div>
      <div
        className="flex cursor-pointer items-center gap-3 md:hidden"
        onClick={() => setIsAddStepOpen(true)}
      >
        <IconButton
          variant="primary"
          icon={<Icon name="plus" size={16} />}
          label="Ajouter une étape"
        />
        <Text font="sans" className="font-semibold">
          Ajouter une étape
        </Text>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
        <ItineraryTimeline
          steps={steps}
          segments={segments}
          dateLabels={dateLabels}
          onDetailView={onDetailView}
          onModifyStep={onModifyStep}
          refetch={refetch}
        />
        <TotalSegment segments={segments} />
      </div>
      {isAddStepOpen && (
        <StepFormModal
          steps={steps}
          travel={travel}
          refetch={refetch}
          onClose={() => setIsAddStepOpen(false)}
        />
      )}
    </>
  );
}
