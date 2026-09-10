export function computeNights(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.valueOf() - start.valueOf()) / msPerDay);
}
