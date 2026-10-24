import { IdeaCard } from "@/features/idea/components/card/IdeaCard";
import type { Idea } from "@/features/idea/types";
import { getProposer } from "@/features/idea/utils/getProposer";
import type { IdeaActions } from "@/features/step/types";
import type { Travel } from "@/features/travel/types";
import Card from "@/shared/ui/Card";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

interface ProposalsNightsProps {
  proposals: Idea[];
  travel: Travel;
  actions: IdeaActions;
}

export function ProposalsNights({
  proposals,
  travel,
  actions,
}: ProposalsNightsProps) {
  const { t } = useTranslation();
  return (
    <Card variant="dashed-accent" className="flex flex-col gap-2 md:gap-3">
      <Text>{t("step.proposals", { count: proposals.length })}</Text>
      {proposals.map((proposal) => {
        const proposer = getProposer(travel, proposal);
        return (
          <IdeaCard
            key={proposal.id}
            idea={proposal}
            chooseButton
            proposerName={proposer.name}
            proposerInitials={proposer.initials}
            onVote={() => actions.onVote(proposal.id)}
            onEdit={() => actions.onEdit(proposal.id)}
            onDelete={() => actions.onDelete(proposal.id)}
            onChoose={() => actions.onChoose(proposal.id)}
          />
        );
      })}
    </Card>
  );
}
