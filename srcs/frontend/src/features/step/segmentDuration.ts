export function computeDurationLabel(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  const label = hours === 0 ? `${minutes} MIN` : `${hours} H ${minutes}`;

  return label;
}
