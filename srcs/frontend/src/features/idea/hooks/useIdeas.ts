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
  createIdea,
  placeIdea,
  voteIdea,
  editIdea,
  deleteIdea,
} from "@/features/idea/api/api.ideas";

export function useIdeas(travelId: number) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [voted, setVoted] = useState<VoteIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

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
  function handleCreateIdea(input: CreateIdeaInput) {
    const newIdea = createIdea(input);

    setIdeas((currentIdeas) => [...currentIdeas, newIdea]);

    setVoted((currentVotes) => [
      ...currentVotes,
      {
        ideaId: newIdea.id,
        voteCount: 0,
        voted: false,
      },
    ]);
  }

  {
    /* Gère le placement d'idée */
  }
  function handlePlaceIdea(ideaId: Idea["id"], input: PlaceIdeaInput) {
    placeIdea(ideaId, input);

    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === ideaId ? { ...idea, ...input } : idea,
      ),
    );
  }

  {
    /* Gère la suppression d'idée */
  }
  function handleDeleteIdea(ideaId: Idea["id"]) {
    deleteIdea(ideaId);

    setIdeas((currentIdeas) =>
      currentIdeas.filter((idea) => idea.id !== ideaId),
    );
  }

  {
    /* Gère la modification d'idée */
  }
  function handleEditIdea(ideaId: Idea["id"], input: EditIdeaInput) {
    editIdea(ideaId, input);

    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              ...input,
              updatedAt: new Date().toISOString(),
            }
          : idea,
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
