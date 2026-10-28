import { useCallback, useEffect, useState } from "react";
import type {
  Idea,
  CreateIdeaInput,
  PlaceIdeaInput,
  EditIdeaInput,
  SocketIdea,
  SocketReaction,
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
import { mapIdeaFromApi } from "@/features/idea/api/ideaMapper";
import { useAuth } from "@/features/auth/context/useAuth";
import {
  useTravelEvent,
  useTravelSocketOpen,
} from "@/features/travel/realtime/useTravelSocket";
import i18n from "@/i18n";

// Replaces the idea if it is already listed, otherwise adds it on top (the
// list is newest first). The REST response and the socket echo of the same
// change can arrive in any order, so both go through here.
function upsertIdea(current: Idea[], idea: Idea) {
  if (!current.some((existing) => existing.id === idea.id)) {
    return [idea, ...current];
  }
  return current.map((existing) => (existing.id === idea.id ? idea : existing));
}

// Socket ideas have no "voted": keep the value this user already had.
function fromSocket(current: Idea[], event: SocketIdea): Idea {
  const existing = current.find((idea) => idea.id === event.id);
  return mapIdeaFromApi({ ...event, voted: existing?.voted ?? false });
}

export function useIdeas(travelId: number) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

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

        setError(
          err instanceof Error ? err.message : i18n.t("idea.errors.loadFailed"),
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

  /* Recharge sans vider la liste (reconnexion du socket) */
  const reloadIdeas = useCallback(async () => {
    try {
      setIdeas(await fetchIdeas(travelId));
    } catch (err) {
      console.error("Impossible de recharger les idées :", err);
    }
  }, [travelId]);

  // Live updates from the other travelers.
  // Catches up on anything changed while the socket was closed.
  useTravelSocketOpen(() => void reloadIdeas());

  useTravelEvent<SocketIdea>("idea.created", (event) =>
    setIdeas((current) => upsertIdea(current, fromSocket(current, event))),
  );
  useTravelEvent<SocketIdea>("idea.updated", (event) =>
    setIdeas((current) => upsertIdea(current, fromSocket(current, event))),
  );
  useTravelEvent<{ id: number }>("idea.deleted", ({ id }) =>
    setIdeas((current) => current.filter((idea) => idea.id !== id)),
  );
  // Ideas placed on a deleted step go back to the pool on the server.
  useTravelEvent("step.deleted", () => void reloadIdeas());

  function applyReaction(event: SocketReaction, voted: boolean) {
    setIdeas((current) =>
      current.map((idea) => {
        if (idea.id !== event.ideaId) return idea;
        // Our own vote from another tab also updates "voted" here.
        const isMine = event.travelerId === currentUser?.id;
        return {
          ...idea,
          voteCount: event.voteCount,
          voted: isMine ? voted : idea.voted,
        };
      }),
    );
  }

  useTravelEvent<SocketReaction>("reaction.created", (event) =>
    applyReaction(event, true),
  );
  useTravelEvent<SocketReaction>("reaction.deleted", (event) =>
    applyReaction(event, false),
  );

  {
    /* Gère la création d'idée */
  }
  async function handleCreateIdea(input: CreateIdeaInput): Promise<void> {
    const newIdea = await postIdea(travelId, input);

    // The socket may have added it already: upsert instead of prepending.
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
    } catch {
      throw new Error(i18n.t("idea.errors.voteRefreshFailed"));
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
