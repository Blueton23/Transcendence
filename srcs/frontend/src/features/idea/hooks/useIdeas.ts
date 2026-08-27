import { useState } from "react";
import type { Idea } from "../types";
import { getIdeas, voteIdea, placeIdea } from "../api/api.ideas";

//gère plusieurs idées
export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>(() => getIdeas());

  function handleVote(ideaId: Idea["id"]) {
    voteIdea(ideaId);
  }

  function handlePlaceIdea(ideaId: Idea["id"], stepId: number) {
    placeIdea(ideaId, stepId);

    setIdeas((currentIdeas) =>
      currentIdeas.map((idea) =>
        idea.id === ideaId ? { ...idea, stepId } : idea,
      ),
    );
  }

  //tableau d'idées
  return {
    ideas,
    handleVote,
    handlePlaceIdea,
  };
}
