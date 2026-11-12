import type { Idea } from "@/features/idea/types";
import { StepIdeaRow } from "@/features/step/components/detail/StepIdeaRow";
import type { IdeaActions } from "@/features/step/types";
import type { Travel } from "@/features/travel/types";
import Card from "@/shared/ui/Card";
import Icon from "@/shared/ui/Icon";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

interface ProposalsNightsProps {
  proposals: Idea[];
  date: string;
  travel: Travel;
  actions: IdeaActions;
}

export function ProposalsNights({
  proposals,
  travel,
  actions,
  date,
}: ProposalsNightsProps) {
  const { t } = useTranslation();
  const start = new Date(date);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 1);
  return (
    <Card variant="dashed-accent" className="flex flex-col gap-2 md:gap-3">
      <div className="flex items-center gap-2">
        <Icon name="moon" size={16} className="text-error" />
        <Text className="font-semibold text-error!">
          {t("step.nightToChoose", {
            start: start.getUTCDate(),
            end: end.getUTCDate(),
          })}
        </Text>
      </div>
      {proposals.map((proposal) => {
        return (
          <StepIdeaRow
            key={proposal.id}
            idea={proposal}
            travel={travel}
            actions={actions}
            chooseButton
          />
        );
      })}
    </Card>
  );
}
