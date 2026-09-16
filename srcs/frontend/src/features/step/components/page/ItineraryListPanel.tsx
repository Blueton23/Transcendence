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
  refetch: () => void;
}

export function ItineraryListPanel({
  steps,
  segments,
  travel,
  dateLabels,
  onDetailView,
  refetch,
}: ItineraryListPanelProps) {
  return (
    <>
      <AddStepForm steps={steps} travel={travel} refetch={refetch} />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-20 md:pb-0">
        <ItineraryTimeline
          steps={steps}
          segments={segments}
          dateLabels={dateLabels}
          onDetailView={onDetailView}
          refetch={refetch}
        />
        <TotalSegment segments={segments} />
      </div>
    </>
  );
}
