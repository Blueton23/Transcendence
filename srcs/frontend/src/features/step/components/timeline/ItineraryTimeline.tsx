import { StepCard } from "@/features/step/components/card/StepCard";
import { SegmentRow } from "@/features/step/components/timeline/Segment";
import { Fragment } from "react/jsx-runtime";
import type { Segment, Step } from "@/features/step/types";
import type { Idea } from "@/features/idea/types";
import { lodgingsByNight } from "@/features/step/utils/lodgingsByNight";
import Card from "@/shared/ui/Card";
import { useTranslation } from "react-i18next";
import { computeTravelDates } from "@/features/travel/utils/computeTravelDates";
import Text from "@/shared/ui/Text";
import Button from "@/shared/ui/Button";
import Icon from "@/shared/ui/Icon";

export interface ItineraryTimelineProps {
  steps: Step[];
  ideas: Idea[];
  segments: (Segment | null)[];
  dateLabels: string[];
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
  onDetailView,
  onModifyStep,
  onDeleteStep,
  onAddStep,
}: ItineraryTimelineProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-x-3 gap-y-2">
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
              <Card
                variant="dashed"
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <Text font="mono" size="sm" tone="secondary">
                    {computeTravelDates(previous.endDate, step.startDate)}
                  </Text>
                  <Text className="font-semibold text-text-secondary!">
                    {t("step.unplannedNights", { count: gapNights })}
                  </Text>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Icon name="plus" size={16} />}
                  onClick={onAddStep}
                >
                  {t("step.add")}
                </Button>
              </Card>
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
    </div>
  );
}
