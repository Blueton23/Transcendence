import type { IdeaActions, Step } from "@/features/step/types";
import type { Travel } from "@/features/travel/types";
import { getStepDays } from "@/features/step/utils/getStepDays";
import { useState } from "react";
import Icon from "@/shared/ui/Icon";
import Tag from "@/shared/ui/Tag";
import type { Idea } from "@/features/idea/types";
import {
  lodgingsByNight,
  type Night,
} from "@/features/step/utils/lodgingsByNight";
import { DayIdeas } from "@/features/step/components/detail/DayIdeas";
import { ChosenNight } from "@/features/step/components/detail/ChosenNight";
import { NoNight } from "@/features/step/components/detail/NoNight";
import { ProposalsNights } from "@/features/step/components/detail/ProposalsNights";

interface IdeaDayProps {
  label: string;
  ideas: Idea[];
  travel: Travel;
  actions: IdeaActions;
  night?: Night;
  onAddLodging: (date: string) => void;
}

function IdeaDay({
  label,
  ideas,
  travel,
  night,
  actions,
  onAddLodging,
}: IdeaDayProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex cursor-pointer items-center gap-2"
        onClick={() => setOpen(!open)}
      >
        <Tag
          icon={
            <Icon
              name={open ? "chev-down" : "chev-right"}
              size={15}
              className="text-muted"
            />
          }
        >
          {label}
        </Tag>
      </div>

      {open && (
        <>
          {night && night.chosen && (
            <ChosenNight night={night.chosen} actions={actions} />
          )}
          {night && !night?.chosen && night?.proposals.length > 0 && (
            <ProposalsNights proposals={night.proposals} />
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
    <div className="flex flex-col gap-4">
      {days.map((day) => (
        <IdeaDay
          key={day.date}
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
