import type { Step } from "@/features/step/types";
import type { Travel } from "@/features/travel/types";
import { getStepDays } from "@/features/step/utils/getStepDays";
import { useState } from "react";
import Icon from "@/shared/ui/Icon";
import Tag from "@/shared/ui/Tag";
import Text from "@/shared/ui/Text";

interface IdeaDayProps {
  label: string;
  // ideas: Idea[];
}

function IdeaDay({ label }: IdeaDayProps) {
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

      {open && <Text>Pas d'idée épinglée</Text>}
      {/* idea si y en a pas et sinon afficher sous le chevron les iddes avec idea.map */}
    </div>
  );
}

interface IdeaSectionProps {
  step: Step;
  travel: Travel;
}

export function IdeaSection({ step, travel }: IdeaSectionProps) {
  const days = getStepDays({ step, travelStartDate: travel.startDate });
  return (
    <div className="flex flex-col gap-4">
      {days.map((day) => (
        <IdeaDay key={day} label={day} />
      ))}
    </div>
  );
}
