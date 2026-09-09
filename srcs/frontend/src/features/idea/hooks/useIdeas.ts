import { useState } from "react";
import type {
  Idea,
  CreateIdeaInput,
  PlaceIdeaInput,
  EditIdeaInput,
} from "../types";
import {
  getIdeas,
  createIdea,
  placeIdea,
  voteIdea,
  editIdea,
} from "../api/api.ideas";

//gère plusieurs idées
export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>(() => getIdeas());

  // fonction qui gère la création d'idée
  function handleCreateIdea(input: CreateIdeaInput) {
    const newIdea = createIdea(input);

    setIdeas((currentIdeas) => [...currentIdeas, newIdea]);
  }

  // fonction qui gère le placement d'idée
  function handlePlaceIdea(ideaId: Idea["id"], stepId: number | null) {
    const input: PlaceIdeaInput = { stepId };
    placeIdea(ideaId, input);

    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === ideaId ? { ...idea, stepId } : idea,
      ),
    );
  }

  // fonction qui gère la suppression d'idée
  function handleDeleteIdea(ideaId: Idea["id"]) {
    setIdeas((currentIdeas) =>
      currentIdeas.filter((idea) => idea.id !== ideaId),
    );
  }

  // fonction qui gère la modification d'idée
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

  // fonction qui gere le vote
  function handleVote(ideaId: Idea["id"]) {
    voteIdea(ideaId);
  }

  // retourne tableau d'idées
  return {
    ideas,
    handleCreateIdea,
    handlePlaceIdea,
    handleDeleteIdea,
    handleEditIdea,
    handleVote,
  };
}
