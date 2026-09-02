import type { Segment } from "@/features/step/api/segmentApi";

export function computeDurationLabel(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  const label = hours === 0 ? `${minutes} MIN` : `${hours} H ${minutes}`;

  return label;
}

export function computeTotalKms(segments: Segment[]): number {
  return segments.reduce((total, segment) => total + segment.distanceKm, 0);
}

export function computeTotalHours(segments: Segment[]): number {
  return segments.reduce(
    (total, segment) => total + segment.durationMinutes,
    0,
  );
}
