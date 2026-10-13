import { useEffect, useState } from "react";
import type {
  Idea,
  CreateIdeaInput,
  PlaceIdeaInput,
  EditIdeaInput,
} from "@/features/idea/types";
import {
  fetchIdeas,
  fetchIdea,
  postIdea,
  patchIdea,
  removeIdea,
  patchIdeaPlacement,
  chooseIdea,
  addIdeaReaction,
  removeIdeaReaction,
} from "@/features/idea/api/api.ideas";

export function useIdeas(travelId: number) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    /* Gère le chargement des idées */
    async function loadIdea() {
      setIsLoading(true);
      setError(null);
      setIdeas([]);

      try {
        if (!Number.isSafeInteger(travelId) || travelId <= 0) {
          throw new Error("Identifiant de voyage invalide");
        }

        const result = await fetchIdeas(travelId);

        if (ignore) {
          return;
        }

        setIdeas(result);
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
  }

  {
    /* Gère la suppression d'idée */
  }
  async function handleDeleteIdea(ideaId: Idea["id"]): Promise<void> {
    await removeIdea(travelId, ideaId);

    setIdeas((currentIdeas) =>
      currentIdeas.filter((idea) => idea.id !== ideaId),
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
  }

  {
    /* Gère le choix d’un hébergement déjà placé */
  }
  async function handleChooseIdea(ideaId: Idea["id"]): Promise<void> {
    const updatedIdea = await chooseIdea(travelId, ideaId);

    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === updatedIdea.id ? updatedIdea : idea,
      ),
    );
  }

  {
    /* Gère le vote */
  }
  async function handleVote(ideaId: Idea["id"]): Promise<void> {
    const currentIdea = ideas.find((idea) => idea.id === ideaId);

    if (!currentIdea) {
      throw new Error("État du vote introuvable.");
    }

    const nextVoted = !currentIdea.voted;

    if (nextVoted) {
      await addIdeaReaction(travelId, ideaId);
    } else {
      await removeIdeaReaction(travelId, ideaId);
    }

    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === ideaId ? { ...idea, voted: nextVoted } : idea,
      ),
    );

    try {
      const updatedIdea = await fetchIdea(travelId, ideaId);

      setIdeas((currentIdeas) =>
        currentIdeas.map((idea) =>
          idea.id === ideaId
            ? {
                ...idea,
                voteCount: updatedIdea.voteCount,
                voted: updatedIdea.voted,
              }
            : idea,
        ),
      );
    } catch {
      throw new Error(
        "La modification de ton vote a été enregistrée, mais le compteur n’a pas pu être actualisé. Recharge la page pour le synchroniser.",
      );
    }
  }

  return {
    ideas,
    isLoading,
    error,
    handleCreateIdea,
    handlePlaceIdea,
    handleDeleteIdea,
    handleEditIdea,
    handleChooseIdea,
    handleVote,
  };
}
