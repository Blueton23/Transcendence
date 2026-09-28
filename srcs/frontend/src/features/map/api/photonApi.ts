import type { Place } from "@/features/map/types";

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: { name?: string; state?: string; country?: string };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

function formatLabel(properties: PhotonFeature["properties"]): string {
  const parts: string[] = [];

  for (const part of [properties.name, properties.state, properties.country]) {
    if (part && !parts.includes(part)) {
      parts.push(part);
    }
  }
  return parts.join(", ");
}

function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

export async function searchPlace(query: string): Promise<Place[]> {
  const response = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=fr&layer=city&layer=locality&layer=other`,
  );
  const data: PhotonResponse = await response.json();
  const places = data.features.map((feature) => ({
    localisation: formatLabel(feature.properties),
    latitude: round6(feature.geometry.coordinates[1]),
    longitude: round6(feature.geometry.coordinates[0]),
  }));

  const unique: Place[] = [];
  for (const place of places) {
    if (!unique.some((p) => p.localisation === place.localisation)) {
      unique.push(place);
    }
  }
  return unique;
}
