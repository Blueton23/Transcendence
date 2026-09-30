import type { Place } from "@/features/map/types";

interface MapboxFeature {
  geometry: { coordinates: [number, number] };
  properties: { full_address: string };
}

interface MapboxResponse {
  features: MapboxFeature[];
}

function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

export async function searchPlace(query: string): Promise<Place[]> {
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const params = new URLSearchParams({
    q: query,
    language: "fr",
    types: "place,locality,district",
    limit: "5",
    access_token: token,
  });

  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/forward?${params}`,
  );
  const data: MapboxResponse = await response.json();

  return data.features.map((feature) => ({
    localisation: feature.properties.full_address,
    longitude: round6(feature.geometry.coordinates[0]),
    latitude: round6(feature.geometry.coordinates[1]),
  }));
}
