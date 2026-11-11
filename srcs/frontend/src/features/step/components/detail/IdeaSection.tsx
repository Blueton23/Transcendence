import type { IdeaActions, Step } from "@/features/step/types";
import type { Travel } from "@/features/travel/types";
import { getStepDays } from "@/features/step/utils/getStepDays";
import { useState } from "react";
import Icon from "@/shared/ui/Icon";
import type { Idea } from "@/features/idea/types";
import {
  lodgingsByNight,
  type Night,
} from "@/features/step/utils/lodgingsByNight";
import { DayIdeas } from "@/features/step/components/detail/DayIdeas";
import { ChosenNight } from "@/features/step/components/detail/ChosenNight";
import { NoNight } from "@/features/step/components/detail/NoNight";
import { ProposalsNights } from "@/features/step/components/detail/ProposalsNights";
import Heading from "@/shared/ui/Heading";

interface IdeaDayProps {
  label: string;
  ideas: Idea[];
  travel: Travel;
  actions: IdeaActions;
  night?: Night;
  isLast: boolean;
  onAddLodging: (date: string) => void;
}

function IdeaDay({
  label,
  ideas,
  travel,
  night,
  actions,
  isLast,
  onAddLodging,
}: IdeaDayProps) {
  const [open, setOpen] = useState(true);

  const railStyle = "flex w-3.5 shrink-0 flex-col items-center";
  const dotStyle =
    "mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-[3px] border-brand-primary bg-surface";
  const lineStyle = "w-0.5 flex-1 bg-border-control";
  return (
    <div className="flex gap-3">
      <div className={railStyle}>
        <span className={dotStyle} />
        {!isLast && <span className={lineStyle} />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 pb-6">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-left"
        >
          <Heading level={2} size="sm">
            {label}
          </Heading>
          <Icon
            name={open ? "chev-down" : "chev-right"}
            size={16}
            className="text-muted"
          />
        </button>

        {open && (
          <>
            {night && night.chosen && (
              <ChosenNight night={night.chosen} actions={actions} />
            )}
            {night && !night?.chosen && night?.proposals.length > 0 && (
              <ProposalsNights
                proposals={night.proposals}
                travel={travel}
                actions={actions}
              />
            )}
            {night && !night.chosen && night.proposals.length === 0 && (
              <NoNight onAddLodging={() => onAddLodging(night.date)} />
            )}
            {ideas.length > 0 && (
              <DayIdeas ideas={ideas} travel={travel} actions={actions} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface IdeaSectionProps {
  step: Step;
  travel: Travel;
  ideas: Idea[];
  actions: IdeaActions;
  onAddLodging: (date: string) => void;
}

export function IdeaSection({
  step,
  ideas,
  travel,
  actions,
  onAddLodging,
}: IdeaSectionProps) {
  const days = getStepDays({ step });
  const nights = lodgingsByNight(ideas, step);
  const stepIdeas = ideas.filter(
    (i) => i.stepId === step.id && i.type !== "accommodation",
  );
  return (
    <div className="flex flex-col">
      {days.map((day, index) => (
        <IdeaDay
          key={day.date}
          isLast={index == days.length - 1}
          travel={travel}
          label={day.label}
          ideas={stepIdeas.filter((i) => i.date === day.date)}
          night={nights.find((n) => n.date === day.date)}
          actions={actions}
          onAddLodging={onAddLodging}
        />
      ))}
    </div>
  );
}
