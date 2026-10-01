import type { Route, RouteGeometry } from "@/features/map/types";

interface DirectionsLeg {
  distance: number;
  duration: number;
}

interface DirectionsRoutes {
  distance: number;
  duration: number;
  legs: DirectionsLeg[];
  geometry: RouteGeometry;
}

interface DirectionsResponse {
  code: string;
  routes: DirectionsRoutes[];
}

type LongLat = [number, number];

export async function getRoute(coords: LongLat[]): Promise<Route | null> {
  const coordsParam = coords.map(([lon, lat]) => `${lon},${lat}`).join(";");
  const params = new URLSearchParams({
    geometries: "geojson",
    overview: "full",
    access_token: import.meta.env.VITE_MAPBOX_TOKEN,
  });

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsParam}?${params}`,
  );
  const data: DirectionsResponse = await response.json();

  if (data.code !== "Ok" || data.routes.length === 0) return null;

  const route = data.routes[0];
  return {
    totalDistanceKm: route.distance / 1000,
    totalDurationMinutes: route.duration / 60,
    legs: route.legs.map((leg) => ({
      distanceKm: leg.distance / 1000,
      durationMinutes: leg.duration / 60,
    })),
    geometry: route.geometry,
  };
}
