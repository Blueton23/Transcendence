import type { Leg, LongLat } from "@/features/map/types";

interface DirectionsRoutes {
  distance: number;
  duration: number;
  geometry: { coordinates: LongLat[] };
}

interface DirectionsResponse {
  code: string;
  routes: DirectionsRoutes[];
}

const cache = new Map<string, Leg | null>();

export async function getLeg(from: LongLat, to: LongLat): Promise<Leg | null> {
  const coordsParam = [from, to].map(([lon, lat]) => `${lon},${lat}`).join(";");
  if (cache.has(coordsParam)) return cache.get(coordsParam) ?? null;

  const params = new URLSearchParams({
    geometries: "geojson",
    overview: "full",
    access_token: import.meta.env.VITE_MAPBOX_TOKEN,
  });

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsParam}?${params}`,
  );
  const data: DirectionsResponse = await response.json();

  let leg: Leg | null;
  if (data.code === "Ok") {
    const route = data.routes[0];
    leg = {
      distanceKm: route.distance / 1000,
      durationMinutes: route.duration / 60,
      coordinates: route.geometry.coordinates,
    };
  } else if (data.code === "NoRoute" || data.code === "NoSegment") {
    leg = null;
  } else {
    throw new Error("Erreur Mapbox");
  }
  cache.set(coordsParam, leg);
  return leg;
}
