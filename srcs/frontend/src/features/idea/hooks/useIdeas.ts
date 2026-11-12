import { useEffect, useRef, useState } from "react";
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
import {
  useTravelEvent,
  useTravelSocketOpen,
} from "@/features/travel/realtime/useTravelSocket";
import i18n from "@/i18n";
import { useError } from "@/shared/context/useError";
import { toErrorMessage } from "@/shared/api/errors";

// Replaces the idea if it is already listed, otherwise adds it on top (the
// list is newest first). A reload triggered by the socket can bring the new
// idea before the POST response does.
function upsertIdea(current: Idea[], idea: Idea) {
  if (!current.some((existing) => existing.id === idea.id)) {
    return [idea, ...current];
  }
  return current.map((existing) => (existing.id === idea.id ? idea : existing));
}

export function useIdeas(travelId: number) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError } = useError();

  useEffect(() => {
    let ignore = false;
    /* Gère le chargement des idées */
    async function loadIdea() {
      setIsLoading(true);
      setError(null);
      setIdeas([]);

      try {
        if (!Number.isSafeInteger(travelId) || travelId <= 0) {
          throw new Error(i18n.t("idea.errors.invalidTravelId"));
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

        setError(toErrorMessage(err));
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

  /* Recharge sans vider la liste (événements du socket) */
  // Live events can trigger several reloads in a row: keep the last one.
  const lastReload = useRef(0);
  async function reloadIdeas() {
    const reload = ++lastReload.current;
    try {
      const result = await fetchIdeas(travelId);
      if (reload === lastReload.current) setIdeas(result);
    } catch {
      showError(i18n.t("idea.errors.loadFailed"));
    }
  }

  // Catches up on anything changed while the socket was closed.
  useTravelSocketOpen(() => void reloadIdeas());

  useTravelEvent("idea.created", () => void reloadIdeas());
  useTravelEvent("idea.updated", () => void reloadIdeas());
  useTravelEvent("idea.deleted", () => void reloadIdeas());
  useTravelEvent("reaction.created", () => void reloadIdeas());
  useTravelEvent("reaction.deleted", () => void reloadIdeas());
  // Ideas placed on a deleted step go back to the pool on the server.
  useTravelEvent("step.deleted", () => void reloadIdeas());

  {
    /* Gère la création d'idée */
  }
  async function handleCreateIdea(input: CreateIdeaInput): Promise<void> {
    const newIdea = await postIdea(travelId, input);

    // A socket reload may have added it already: upsert instead of prepending.
    setIdeas((currentIdeas) => upsertIdea(currentIdeas, newIdea));
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
      throw new Error(i18n.t("idea.errors.notFound"));
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
      throw new Error(i18n.t("idea.errors.voteNotFound"));
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
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error(i18n.t("idea.errors.voteRefreshFailed"));
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
