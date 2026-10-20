import type { Idea } from "@/features/idea/types";
import Card from "@/shared/ui/Card";

interface ProposalsNightsProps {
  proposals: Idea[];
}

export function ProposalsNights({ proposals }: ProposalsNightsProps) {
  return <Card>{proposals.length}</Card>;
}
