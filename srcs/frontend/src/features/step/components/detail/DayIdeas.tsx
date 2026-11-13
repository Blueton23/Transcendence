import type { Idea } from "@/features/idea/types";
import { StepIdeaRow } from "@/features/step/components/detail/StepIdeaRow";
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
      {ideas.map((idea) => (
        <StepIdeaRow
          key={idea.id}
          idea={idea}
          travel={travel}
          actions={actions}
        />
      ))}
    </>
  );
}
