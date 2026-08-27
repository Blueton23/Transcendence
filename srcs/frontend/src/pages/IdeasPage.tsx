import { useState } from "react";
import { useIdeas } from "../features/idea/hooks/useIdeas";
import { IdeaCard } from "../features/idea/components/IdeaCard";
import { PinIdeaButton } from "../features/idea/components/page/PinIdeaButton";
import { IdeaTypeFilter } from "../features/idea/components/page/IdeaTypeFilter";
import { IdeaStepFilter } from "../features/idea/components/page/IdeaStepFilter";
import { CreateIdeaModal } from "../features/idea/components/create_idea_modal/CreateIdeaModal";
import type { IdeaFilter, StepFilter } from "../features/idea/types";
import { filterIdeas } from "../features/idea/utils/filterIdeas";
import Heading from "../shared/ui/Heading";
import Text from "../shared/ui/Text";

//A SUPPRIMER, mettre useStep dans la foncton princiale et dans le .map
const mockSteps = [
  { id: 1, name: "Interlaken" },
  { id: 2, name: "Zermatt" },
];

/*----------------------------------------------------------------------------------*/

// Fonction principale pour la page idée
export function IdeasPage() {
  const { ideas, handleVote, handlePlaceIdea } = useIdeas();

  const [typeActiveFilter, setTypeActiveFilter] = useState<IdeaFilter>("all");
  const [stepActiveFilter, setStepActiveFilter] = useState<StepFilter>("all");

  const [ideaToPlaceId, setIdeaToPlaceId] = useState<number | null>(null);
  const [viewedStepId, setViewedStepId] = useState<number | null>(null);

  const [createIdeaModalOpen, setCreateIdeaModalOpen] = useState(false);

  const filteredIdeas = filterIdeas(ideas, typeActiveFilter, stepActiveFilter);

  return (
    <div className="px-8 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <Heading level={1} size="lg">
          Idées
        </Heading>
        <PinIdeaButton onClick={() => setCreateIdeaModalOpen(true)} />
      </div>

      <div>
        <Text tone="primary" className="mb-1">
          Type
        </Text>
        <div className="-mb-2 flex flex-wrap gap-2">
          <IdeaTypeFilter
            typeActiveFilter={typeActiveFilter}
            onChange={setTypeActiveFilter}
          />
        </div>
      </div>

      <div>
        <Text tone="primary" className="mb-1">
          Etape
        </Text>
        <div className="-mb-2 flex flex-wrap gap-2">
          <IdeaStepFilter
            steps={mockSteps}
            stepActiveFilter={stepActiveFilter}
            onChange={setStepActiveFilter}
          />
        </div>
      </div>

      {filteredIdeas.map((idea) => {
        const step = mockSteps.find((step) => step.id === idea.stepId);

        return (
          <IdeaCard
            key={idea.id}
            idea={idea}
            proposerName="David"
            proposerInitials="DL"
            voteCount={0}
            voted={false}
            stepName={step?.name}
            onVote={() => handleVote(idea.id)}
            onPlace={() => setIdeaToPlaceId(idea.id)}
            onView={() => setViewedStepId(idea.stepId)}
          />
        );
      })}

      {createIdeaModalOpen && (
        <CreateIdeaModal
          steps={mockSteps}
          onClose={() => setCreateIdeaModalOpen(false)}
        />
      )}
    </div>
  );
}
