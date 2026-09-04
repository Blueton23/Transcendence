import { useState } from "react";
import type { Idea, CreateIdeaInput, PlaceIdeaInput } from "../types";
import { getIdeas, createIdea, placeIdea, voteIdea } from "../api/api.ideas";

//gère plusieurs idées
export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>(() => getIdeas());

  function handleCreateIdea(input: CreateIdeaInput) {
    const newIdea = createIdea(input);

    setIdeas((currentIdeas) => [...currentIdeas, newIdea]);
  }

  function handlePlaceIdea(ideaId: Idea["id"], stepId: number | null) {
    const input: PlaceIdeaInput = { stepId };
    placeIdea(ideaId, input);

    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === ideaId ? { ...idea, stepId } : idea,
      ),
    );
  }

  function handleDeleteIdea(ideaId: Idea["id"]) {
    setIdeas((currentIdeas) =>
      currentIdeas.filter((idea) => idea.id !== ideaId),
    );
  }

  function handleVote(ideaId: Idea["id"]) {
    voteIdea(ideaId);
  }

  //tableau d'idées
  return {
    ideas,
    handleCreateIdea,
    handlePlaceIdea,
    handleDeleteIdea,
    handleVote,
  };
}
