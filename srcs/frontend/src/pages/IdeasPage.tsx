import { useState } from "react";
import { useIdeas } from "@/features/idea/hooks/useIdeas";
import { IdeaCard } from "@/features/idea/components/card/IdeaCard";
import { PinIdeaButton } from "@/features/idea/components/page/PinIdeaButton";
import { IdeaTypeFilter } from "@/features/idea/components/page/IdeaTypeFilter";
import { IdeaStepFilter } from "@/features/idea/components/page/IdeaStepFilter";
import { CreateIdeaModal } from "@/features/idea/components/modal/CreateIdeaModal";
import { PlaceIdeaModal } from "@/features/idea/components/modal/PlaceIdeaModal";
import { EditIdeaModal } from "@/features/idea/components/modal/EditIdeaModal";
import type { IdeaFilter, StepFilter, StepOption } from "@/features/idea/types";
import { filterIdeas } from "@/features/idea/utils/filterIdeas";
import { useParams } from "react-router";
import { useSteps } from "@/features/step/hooks/useSteps";
import { useTravel } from "@/features/travel/hooks/useTravel";
import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";

// Fonction principale pour la page idée
export function IdeasPage() {
  const { id } = useParams();
  const travelId = Number(id);

  const {
    ideas,
    isLoading,
    error,
    handleCreateIdea,
    handlePlaceIdea,
    handleDeleteIdea,
    handleEditIdea,
    handleVote,
    voted,
  } = useIdeas(travelId);

  const {
    steps,
    isLoading: isLoadingSteps,
    error: errorSteps,
  } = useSteps(travelId);

  const {
    travel,
    isLoading: isLoadingTravel,
    error: errorTravel,
  } = useTravel(travelId);

  const stepOptions: StepOption[] = steps.map((step) => ({
    id: step.id,
    name: step.localisation,
  }));

  const [typeActiveFilter, setTypeActiveFilter] = useState<IdeaFilter>("all");
  const [stepActiveFilter, setStepActiveFilter] = useState<StepFilter>("all");
  const filteredIdeas = filterIdeas(ideas, typeActiveFilter, stepActiveFilter);

  const [createIdeaModalOpen, setCreateIdeaModalOpen] = useState(false);

  const [ideaPlaceId, setIdeaPlaceId] = useState<number | null>(null);
  const ideaToPlace = ideas.find((idea) => idea.id === ideaPlaceId);

  const [editIdeaId, setEditIdeaId] = useState<number | null>(null);
  const editIdea = ideas.find((idea) => idea.id === editIdeaId);

  if (isLoading || isLoadingSteps || isLoadingTravel) {
    return <Text>Chargement des idées, des étapes et des voyageurs…</Text>;
  }

  if (error || errorSteps || errorTravel) {
    return <Text>{error || errorSteps || errorTravel}</Text>;
  }

  if (!travel) {
    return <Text>Voyage introuvable.</Text>;
  }

  return (
    <div className="px-4 pt-8 md:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Heading level={1} size="lg">
          Idées
        </Heading>
        <PinIdeaButton onClick={() => setCreateIdeaModalOpen(true)} />
      </div>

      <div>
        <Text className="mb-1">Type</Text>
        <IdeaTypeFilter
          typeActiveFilter={typeActiveFilter}
          onChange={setTypeActiveFilter}
        />
      </div>

      <div>
        <Text className="mb-1">Etape</Text>
        <IdeaStepFilter
          steps={stepOptions}
          stepActiveFilter={stepActiveFilter}
          onChange={setStepActiveFilter}
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredIdeas.length === 0 && (
          <Text tone="muted">
            {ideas.length === 0
              ? "Aucune idée pour ce voyage."
              : "Aucune idée ne correspond aux filtres sélectionnés."}
          </Text>
        )}

        {filteredIdeas.map((idea) => {
          const step = stepOptions.find((step) => step.id === idea.stepId);

          const proposer = travel.travelers.find(
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
          steps={stepOptions}
          onClose={() => setCreateIdeaModalOpen(false)}
          onCreate={handleCreateIdea}
        />
      )}

      {ideaToPlace && (
        <PlaceIdeaModal
          idea={ideaToPlace}
          steps={stepOptions}
          onClose={() => setIdeaPlaceId(null)}
          onPlace={handlePlaceIdea}
        />
      )}

      {editIdea && (
        <EditIdeaModal
          idea={editIdea}
          steps={stepOptions}
          onClose={() => setEditIdeaId(null)}
          onEdit={(input) => handleEditIdea(editIdea.id, input)}
        />
      )}
    </div>
  );
}
