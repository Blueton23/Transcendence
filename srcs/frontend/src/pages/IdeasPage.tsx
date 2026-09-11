import { useState } from "react";
import { useIdeas } from "../features/idea/hooks/useIdeas";
import { IdeaCard } from "../features/idea/components/IdeaCard";
import { PinIdeaButton } from "../features/idea/components/page/PinIdeaButton";
import { IdeaTypeFilter } from "../features/idea/components/page/IdeaTypeFilter";
import { IdeaStepFilter } from "../features/idea/components/page/IdeaStepFilter";
import { CreateIdeaModal } from "../features/idea/components/create-idea/CreateIdeaModal";
import { PlaceIdeaModal } from "../features/idea/components/place-idea/PlaceIdeaModal";
import { EditIdeaModal } from "../features/idea/components/edit-idea/EditIdeaModal";
import type { IdeaFilter, StepFilter } from "../features/idea/types";
import { filterIdeas } from "../features/idea/utils/filterIdeas";
import Heading from "../shared/ui/Heading";
import Text from "../shared/ui/Text";

//A SUPPRIMER, mettre useStep dans la foncton princiale et dans le .map
const mockSteps = [
  { id: 1, name: "Interlaken" },
  { id: 2, name: "Zermatt" },
];

const mockTravelers = [
  { id: 1, name: "David", initials: "DL" },
  { id: 2, name: "Alice", initials: "AM" },
];

/*----------------------------------------------------------------------------------*/

// Fonction principale pour la page idée
export function IdeasPage() {
  const {
    ideas,
    handleCreateIdea,
    handlePlaceIdea,
    handleDeleteIdea,
    handleEditIdea,
    handleVote,
    voted,
  } = useIdeas();

  const [typeActiveFilter, setTypeActiveFilter] = useState<IdeaFilter>("all");
  const [stepActiveFilter, setStepActiveFilter] = useState<StepFilter>("all");
  const filteredIdeas = filterIdeas(ideas, typeActiveFilter, stepActiveFilter);

  const [createIdeaModalOpen, setCreateIdeaModalOpen] = useState(false);

  const [ideaPlaceId, setIdeaPlaceId] = useState<number | null>(null);
  const ideaToPlace = ideas.find((idea) => idea.id === ideaPlaceId);

  const [editIdeaId, setEditIdeaId] = useState<number | null>(null);
  const editIdea = ideas.find((idea) => idea.id === editIdeaId);

  return (
    <div className="px-4 pt-8 pb-28 sm:px-8">
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

      <div className="flex flex-col gap-3">
        {filteredIdeas.map((idea) => {
          const step = mockSteps.find((step) => step.id === idea.stepId);

          const proposer = mockTravelers.find(
            (traveler) => traveler.id === idea.travelerId,
          );

          const vote = voted.find((vote) => vote.ideaId === idea.id);

          return (
            <IdeaCard
              key={idea.id}
              idea={idea}
              proposerName={proposer?.name ?? "Inconnu"}
              proposerInitials={proposer?.initials ?? "?"}
              voteCount={vote?.voteCount ?? 0}
              voted={vote?.voted ?? false}
              stepName={step?.name}
              onVote={() => handleVote(idea.id)}
              onPlace={() => setIdeaPlaceId(idea.id)}
              onView={() => null}
              onEdit={() => setEditIdeaId(idea.id)}
              onDelete={() => handleDeleteIdea(idea.id)}
            />
          );
        })}
      </div>

      {createIdeaModalOpen && (
        <CreateIdeaModal
          steps={mockSteps}
          onClose={() => setCreateIdeaModalOpen(false)}
          onCreate={handleCreateIdea}
        />
      )}

      {ideaPlaceId !== null && (
        <PlaceIdeaModal
          idea={ideaToPlace}
          steps={mockSteps}
          onClose={() => setIdeaPlaceId(null)}
          onPlace={handlePlaceIdea}
        />
      )}

      {editIdeaId && (
        <EditIdeaModal
          idea={editIdea}
          steps={mockSteps}
          onClose={() => setEditIdeaId(null)}
          onEdit={(input) => handleEditIdea(editIdea.id, input)}
        />
      )}
    </div>
  );
}
