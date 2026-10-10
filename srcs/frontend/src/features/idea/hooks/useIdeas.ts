import { useEffect, useState } from "react";
import type {
  Idea,
  CreateIdeaInput,
  PlaceIdeaInput,
  EditIdeaInput,
  VoteIdea,
} from "@/features/idea/types";
import {
  fetchIdeas,
  postIdea,
  patchIdea,
  removeIdea,
  patchIdeaPlacement,
  voteIdea,
} from "@/features/idea/api/api.ideas";

export function useIdeas(travelId: number) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [voted, setVoted] = useState<VoteIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    /* Gère le chargement des idées */
    async function loadIdea() {
      setIsLoading(true);
      setError(null);
      setIdeas([]);
      setVoted([]);

      try {
        if (!Number.isSafeInteger(travelId) || travelId <= 0) {
          throw new Error("Identifiant de voyage invalide");
        }

        const result = await fetchIdeas(travelId);

        if (ignore) {
          return;
        }

        setIdeas(result);
        setVoted(
          result.map((idea) => ({
            ideaId: idea.id,
            voteCount: idea.voteCount,
            voted: idea.voted,
          })),
        );
      } catch (err) {
        if (ignore) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les idées",
        );
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadIdea();

    return () => {
      ignore = true;
    };
  }, [travelId]);

  {
    /* Gère la création d'idée */
  }
  async function handleCreateIdea(input: CreateIdeaInput): Promise<void> {
    const newIdea = await postIdea(travelId, input);

    setIdeas((currentIdeas) => [newIdea, ...currentIdeas]);

    setVoted((currentVotes) => [
      ...currentVotes,
      {
        ideaId: newIdea.id,
        voteCount: newIdea.voteCount,
        voted: newIdea.voted,
      },
    ]);
  }

  {
    /* Gère la modification d'idée */
  }
  async function handleEditIdea(
    ideaId: Idea["id"],
    input: EditIdeaInput,
  ): Promise<void> {
    const updatedIdea = await patchIdea(travelId, ideaId, input);

    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === updatedIdea.id ? updatedIdea : idea,
      ),
    );

    setVoted((currentVotes) =>
      currentVotes.map((vote) =>
        vote.ideaId === updatedIdea.id
          ? {
              ideaId: updatedIdea.id,
              voteCount: updatedIdea.voteCount,
              voted: updatedIdea.voted,
            }
          : vote,
      ),
    );
  }

  {
    /* Gère la suppression d'idée */
  }
  async function handleDeleteIdea(ideaId: Idea["id"]): Promise<void> {
    await removeIdea(travelId, ideaId);

    setIdeas((currentIdeas) =>
      currentIdeas.filter((idea) => idea.id !== ideaId),
    );

    setVoted((currentVotes) =>
      currentVotes.filter((vote) => vote.ideaId !== ideaId),
    );
  }

  {
    /* Gère le placement d'idée */
  }
  async function handlePlaceIdea(
    ideaId: Idea["id"],
    input: PlaceIdeaInput,
  ): Promise<void> {
    const ideaToPlace = ideas.find((idea) => idea.id === ideaId);

    if (!ideaToPlace) {
      throw new Error("Idée introuvable.");
    }

    const updatedIdea = await patchIdeaPlacement(travelId, ideaToPlace, input);

    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === updatedIdea.id ? updatedIdea : idea,
      ),
    );

    setVoted((currentVotes) =>
      currentVotes.map((vote) =>
        vote.ideaId === updatedIdea.id
          ? {
              ideaId: updatedIdea.id,
              voteCount: updatedIdea.voteCount,
              voted: updatedIdea.voted,
            }
          : vote,
      ),
    );
  }

  {
    /* Gère le vote */
  }
  function handleVote(ideaId: Idea["id"]) {
    voteIdea(ideaId);

    setVoted((currentVotes) =>
      currentVotes.map((vote) =>
        vote.ideaId === ideaId
          ? {
              ...vote,
              voted: !vote.voted,
              voteCount: vote.voted ? vote.voteCount - 1 : vote.voteCount + 1,
            }
          : vote,
      ),
    );
  }

  return {
    ideas,
    isLoading,
    error,
    handleCreateIdea,
    handlePlaceIdea,
    handleDeleteIdea,
    handleEditIdea,
    handleVote,
    voted,
  };
}
