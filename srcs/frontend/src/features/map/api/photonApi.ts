import type { Place } from "@/features/map/types";

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: { name?: string; city?: string; country?: string };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

function formatLabel(properties: PhotonFeature["properties"]): string {
  const parts: string[] = [];

  for (const part of [properties.name, properties.city, properties.country]) {
    if (part && !parts.includes(part)) {
      parts.push(part);
    }
  }
  return parts.join(", ");
}

export async function searchPlace(query: string): Promise<Place[]> {
  const response = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`,
  );
  const data: PhotonResponse = await response.json();
  return data.features.map((feature) => ({
    localisation: formatLabel(feature.properties),
    latitude: feature.geometry.coordinates[0],
    longitude: feature.geometry.coordinates[1],
  }));
}
