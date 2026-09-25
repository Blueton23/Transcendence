export function formatNights(nights: number): string {
  if (nights === 0) return "Pas de nuit";
  if (nights === 1) return "1 nuit";
  return `${nights} nuits`;
}
