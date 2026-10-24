import type { Idea } from "@/features/idea/types";
import type { Travel } from "@/features/travel/types";
import i18n from "@/i18n";

export function getProposer(travel: Travel, idea: Idea) {
  const proposer = travel.travelers.find((t) => t.id === idea.travelerId);
  return {
    name: proposer?.name ?? i18n.t("idea.unknownProposer"),
    initials: proposer?.initials ?? "?",
  };
}
