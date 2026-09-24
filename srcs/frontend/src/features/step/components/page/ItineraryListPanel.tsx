import type { Segment } from "@/features/step/api/segmentApi";
import type { Step } from "@/features/step/types";
import { ItineraryTimeline } from "@/features/step/components/timeline/ItineraryTimeline";
import { TotalSegment } from "../timeline/TotalSegment";
import { AddStepForm } from "@/features/step/components/add-step";
import type { Travel } from "@/features/travel/types";

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
  return (
    <>
      <div className="hidden md:block">
        <AddStepForm steps={steps} travel={travel} refetch={refetch} />
      </div>
      <div className="flex flex-col gap-6 md:min-h-0 md:flex-1 md:overflow-y-auto">
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
    </>
  );
}
