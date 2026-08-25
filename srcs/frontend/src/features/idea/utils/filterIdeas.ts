import type { Idea, IdeaType } from "../types";

export type IdeaFilter = "all" | IdeaType;
export type StepFilter = "all" | "none" | number;

export function filterIdeas(
  ideas: Idea[],
  typeActiveFilter: IdeaFilter,
  stepActiveFilter: StepFilter,
) {
  let filteredIdeas = ideas;

  if (typeActiveFilter !== "all") {
    filteredIdeas = filteredIdeas.filter(
      (idea) => idea.type === typeActiveFilter,
    );
  }

  if (stepActiveFilter === "none") {
    filteredIdeas = filteredIdeas.filter((idea) => idea.stepId === null);
  } else if (stepActiveFilter !== "all") {
    filteredIdeas = filteredIdeas.filter(
      (idea) => idea.stepId === stepActiveFilter,
    );
  }

  return filteredIdeas;
}