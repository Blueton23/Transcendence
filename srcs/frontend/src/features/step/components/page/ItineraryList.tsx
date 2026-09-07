import type { Segment } from "@/features/step/api/segmentApi";
import type { Step } from "@/features/step/types";
import { ItineraryTimeline } from "./ItineraryTimeline";
import { TotalSegment } from "./TotalSegment";
import { TripActionsButton } from "./TripActionButton";
import { AddStepForm } from "@/features/step/components/add-step";

interface ItineraryListProps {
  steps: Step[];
  segments: Segment[];
  dateLabels: string[];
  onDetailView: (step: Step) => void;
}

export function ItineraryList({
  steps,
  segments,
  dateLabels,
  onDetailView,
}: ItineraryListProps) {
  return (
    <>
      <AddStepForm />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-20 md:pb-0">
        <ItineraryTimeline
          steps={steps}
          segments={segments}
          dateLabels={dateLabels}
          onDetailView={onDetailView}
        />
        <TotalSegment segments={segments} />
        <TripActionsButton />
      </div>
    </>
  );
}
