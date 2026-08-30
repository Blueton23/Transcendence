import { useState } from "react";
import { useIdeas } from "../features/idea/hooks/useIdeas";
import { IdeaCard } from "../features/idea/components/IdeaCard";
import { PinIdeaButton } from "../features/idea/components/page/PinIdeaButton";
import { IdeaTypeFilter } from "../features/idea/components/page/IdeaTypeFilter";
import { IdeaStepFilter } from "../features/idea/components/page/IdeaStepFilter";
import { CreateIdeaModal } from "../features/idea/components/create-idea-modal/CreateIdeaModal";
import { PlaceIdeaModal } from "../features/idea/components/place-idea-modal/PlaceIdeaModal";
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
  const { ideas, handleVote, handlePlaceIdea, handleCreateIdea, } = useIdeas();

  const [typeActiveFilter, setTypeActiveFilter] = useState<IdeaFilter>("all");
  const [stepActiveFilter, setStepActiveFilter] = useState<StepFilter>("all");
  const filteredIdeas = filterIdeas(ideas, typeActiveFilter, stepActiveFilter);

  const [ideaToPlaceId, setIdeaToPlaceId] = useState<number | null>(null);
  const ideaToPlace = ideas.find((idea) => idea.id === ideaToPlaceId);

  const [createIdeaModalOpen, setCreateIdeaModalOpen] = useState(false);

  return (
    <div className="px-4 sm:px-8 pt-8">
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
        <IdeaTypeFilter
          typeActiveFilter={typeActiveFilter}
          onChange={setTypeActiveFilter}
        />
      </div>

      <div>
        <Text tone="primary" className="mb-1">
          Etape
        </Text>
        <IdeaStepFilter
          steps={mockSteps}
          stepActiveFilter={stepActiveFilter}
          onChange={setStepActiveFilter}
        />
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
            onView={() => (null)}
          />
        );
      })}

      {createIdeaModalOpen && (
        <CreateIdeaModal
          steps={mockSteps}
          onClose={() => setCreateIdeaModalOpen(false)}
          onCreate={handleCreateIdea}
        />
      )}

      {ideaToPlaceId !== null && (
        <PlaceIdeaModal
        idea={ideaToPlace}
        steps={mockSteps}
        onClose={() => setIdeaToPlaceId(null)}
        onPlace={handlePlaceIdea}
        />
      )}

    </div>
  );
}


//steps={mockSteps}