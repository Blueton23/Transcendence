export type LongLat = [number, number];

export interface Place {
  label?: string;
  localisation: string;
  latitude: number;
  longitude: number;
}

export interface RouteGeometry {
  type: "MultiLineString";
  coordinates: LongLat[][];
}

export interface LegSummary {
  distanceKm: number;
  durationMinutes: number;
}

export interface Leg extends LegSummary {
  coordinates: LongLat[];
}

export interface Route {
  totalDistanceKm: number;
  totalDurationMinutes: number;
  legs: (LegSummary | null)[];
  geometry: RouteGeometry;
}
