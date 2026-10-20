import type { Idea } from "@/features/idea/types";

interface ChosenNightProps {
  night: Idea;
}

export function ChosenNight({ night }: ChosenNightProps) {
  return <div>{night.arrivalDate}</div>;
}
