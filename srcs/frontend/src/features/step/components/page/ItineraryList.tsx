import type { Segment } from "@/features/step/api/segmentApi";
import type { Step } from "@/features/step/types";
import { AddStepForm } from "@/features/step/components/add-step";
import { ItineraryTimeline } from "./ItineraryTimeline";
import { TotalSegment } from "./TotalSegment";
import { TripActionsButton } from "./TripActionButton";

interface ItineraryListProps {
  steps: Step[];
  segments: Segment[];
  dateLabels: string[];
}

export function ItineraryList({
  steps,
  segments,
  dateLabels,
}: ItineraryListProps) {
  return (
    <>
      <AddStepForm />
      <ItineraryTimeline
        steps={steps}
        segments={segments}
        dateLabels={dateLabels}
      />
      <TotalSegment segments={segments} />
      <TripActionsButton />
    </>
  );
}
