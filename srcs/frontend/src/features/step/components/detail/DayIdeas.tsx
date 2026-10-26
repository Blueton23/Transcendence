import { IdeaCard } from "@/features/idea/components/card/IdeaCard";
import type { Idea } from "@/features/idea/types";
import { getProposer } from "@/features/idea/utils/getProposer";
import type { IdeaActions } from "@/features/step/types";
import type { Travel } from "@/features/travel/types";

interface DayIdeasProps {
  ideas: Idea[];
  travel: Travel;
  actions: IdeaActions;
}

export function DayIdeas({ ideas, travel, actions }: DayIdeasProps) {
  return (
    <>
      {ideas.map((idea) => {
        const proposer = getProposer(travel, idea);
        return (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onDelete={() => actions.onDelete(idea.id)}
            onEdit={() => actions.onEdit(idea.id)}
            onVote={() => actions.onVote(idea.id)}
            onChoose={() => actions.onChoose(idea.id)}
            proposerName={proposer.name}
            proposerInitials={proposer.initials}
          />
        );
      })}
    </>
  );
}
