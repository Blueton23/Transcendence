import { StepCard } from "@/features/step/components/card/StepCard";
import { SegmentRow } from "@/features/step/components/timeline/Segment";
import { Fragment } from "react/jsx-runtime";
import type { Segment, Step } from "@/features/step/types";
import type { Idea } from "@/features/idea/types";
import { lodgingsByNight } from "@/features/step/utils/lodgingsByNight";
import { UnplannedNights } from "@/features/step/components/timeline/UnplannedNights";
import type { Travel } from "@/features/travel/types";

export interface ItineraryTimelineProps {
  steps: Step[];
  ideas: Idea[];
  segments: (Segment | null)[];
  dateLabels: string[];
  travel: Travel;
  onDetailView: (step: Step) => void;
  onModifyStep: (step: Step) => void;
  onDeleteStep: (step: Step) => Promise<void>;
  onAddStep: () => void;
}

export function ItineraryTimeline({
  steps,
  ideas,
  segments,
  dateLabels,
  travel,
  onDetailView,
  onModifyStep,
  onDeleteStep,
  onAddStep,
}: ItineraryTimelineProps) {
  const lastStep = steps[steps.length - 1];
  const endGapNights = lastStep
    ? (new Date(travel.endDate).getTime() -
        new Date(lastStep.endDate).getTime()) /
      86_400_000
    : 0;

  const firstStep = steps[0];
  const startGapNights = firstStep
    ? (new Date(firstStep.startDate).getTime() -
        new Date(travel.startDate).getTime()) /
      86_400_000
    : 0;
  return (
    <div className="flex flex-col gap-x-3 gap-y-2">
      {startGapNights > 0 && (
        <UnplannedNights
          start={travel.startDate}
          end={firstStep.startDate}
          nights={endGapNights}
          onAdd={onAddStep}
        />
      )}
      {steps.map((step, index) => {
        const segment = segments[index - 1];
        const previous = steps[index - 1];
        const gapNights = previous
          ? (new Date(step.startDate).getTime() -
              new Date(previous.endDate).getTime()) /
            86_400_000
          : 0;
        const nights = lodgingsByNight(ideas, step);
        const lodging = {
          lodged: nights.filter((n) => n.chosen).length,
          total: nights.length,
        };

        return (
          <Fragment key={step.id}>
            {index > 0 && segment !== undefined && gapNights === 0 && (
              <SegmentRow segment={segment} />
            )}
            {gapNights > 0 && (
              <UnplannedNights
                start={previous.endDate}
                end={step.startDate}
                nights={gapNights}
                onAdd={onAddStep}
              />
            )}
            <StepCard
              step={step}
              lodging={lodging}
              dateLabel={dateLabels[index]}
              onClick={() => onDetailView(step)}
              onModify={() => onModifyStep(step)}
              onDelete={() => onDeleteStep(step)}
              index={index}
            />
          </Fragment>
        );
      })}
      {endGapNights > 0 && (
        <UnplannedNights
          start={lastStep.endDate}
          end={travel.endDate}
          nights={endGapNights}
          onAdd={onAddStep}
        />
      )}
    </div>
  );
}
