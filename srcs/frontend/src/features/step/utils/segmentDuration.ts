export function computeDurationLabel(durationMinutes: number): string {
  const rounded = Math.round(durationMinutes);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;

  const label = hours === 0 ? `${minutes} MIN` : `${hours} H ${minutes}`;

  return label;
}
