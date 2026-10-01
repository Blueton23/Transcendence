export interface Place {
  label?: string;
  localisation: string;
  latitude: number;
  longitude: number;
}

export interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][];
}

export interface Route {
  totalDistanceKm: number;
  totalDurationMinutes: number;
  legs: { distanceKm: number; durationMinutes: number }[];
  geometry: RouteGeometry;
}
