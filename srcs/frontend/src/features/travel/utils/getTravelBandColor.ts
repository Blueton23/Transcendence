const bands = [
  "bg-band-1",
  "bg-band-2",
  "bg-band-3",
  "bg-band-4",
  "bg-band-5",
  "bg-band-6",
] as const;

export function getTravelBandColor(travelId: number) {
  return bands[travelId % bands.length];
}
