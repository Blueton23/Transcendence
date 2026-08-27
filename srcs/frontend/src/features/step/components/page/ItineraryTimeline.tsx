import { StepPositionBadge } from "@/features/step/components/card/StepPositionBadge";
import { StepCard } from "@/features/step/components/card/StepCard";
import { SegmentRow } from "./Segment";
import { Fragment } from "react/jsx-runtime";
import type { Segment } from "@/features/step/api/segmentApi";
import type { Step } from "@/features/step/types";

export interface ItineraryTimelineProps {
  steps: Step[];
  segments: Segment[];
  dateLabels: string[];
}

export function ItineraryTimeline({
  steps,
  segments,
  dateLabels,
}: ItineraryTimelineProps) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
      {steps.map((step, index) => (
        <Fragment key={step.id}>
          {index > 0 && (
            <Fragment>
              <span aria-hidden="true" />
              <SegmentRow segment={segments[index - 1]} />
            </Fragment>
          )}
          <StepPositionBadge position={step.position} />
          <StepCard step={step} dateLabel={dateLabels[index]} ideaCount={2} />
        </Fragment>
      ))}
    </div>
  );
}
