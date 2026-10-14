import type { Step } from "@/features/step/types";

type LongLat = [number, number];

interface Bounds {
  min: LongLat;
  max: LongLat;
}
export function getStepsBounds(steps: Step[]): Bounds | undefined {
  const coords: LongLat[] = steps
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => [Number(s.longitude), Number(s.latitude)]);

  if (coords.length === 0) return undefined;

  const longs = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);

  return {
    min: [Math.min(...longs), Math.min(...lats)],
    max: [Math.max(...longs), Math.max(...lats)],
  };
}
