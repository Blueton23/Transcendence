export interface Segment {
  durationMinutes: number;
  distanceKm: number;
}

//TODO(branchement): viendra d'un appel a l'API de geolocalisation/routing choisie
export function getSegments(): Segment[] {
  return [
    {
      durationMinutes: 70,
      distanceKm: 87,
    },
    {
      durationMinutes: 140,
      distanceKm: 132,
    },
  ];
}
