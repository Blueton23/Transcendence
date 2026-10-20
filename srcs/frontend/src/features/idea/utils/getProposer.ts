import type { Idea } from "@/features/idea/types";
import type { Travel } from "@/features/travel/types";

export function getProposer(travel: Travel, idea: Idea) {
  const proposer = travel.travelers.find((t) => t.id === idea.travelerId);
  return {
    name: proposer?.name ?? "Inconnu",
    initials: proposer?.initials ?? "?",
  };
}
