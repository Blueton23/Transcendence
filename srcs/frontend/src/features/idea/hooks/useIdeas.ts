import { useState } from "react";
import type {
  Idea,
  CreateIdeaInput,
  PlaceIdeaInput,
  EditIdeaInput,
  VoteIdea,
} from "@/features/idea/types";
import {
  getIdeas,
  createIdea,
  placeIdea,
  voteIdea,
  editIdea,
  getIdeaVotes,
  deleteIdea,
} from "@/features/idea/api/api.ideas";

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>(() => getIdeas());
  const [voted, setVoted] = useState<VoteIdea[]>(() => getIdeaVotes());

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
    handleCreateIdea,
    handlePlaceIdea,
    handleDeleteIdea,
    handleEditIdea,
    handleVote,
    voted,
  };
}
