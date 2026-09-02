import type { Step } from "@/features/step/types";

//TODO(branchement): fonction en dur pour le moment. A terme: async, rprend travelId en param, fetch reel et mapping API
// pour convertir les champs Decimal de DRF en number
export function getSteps(): Step[] {
  return [
    {
      id: 1,
      travelId: 1,
      position: 1,
      nights: 0,
      localisation: "Montreux",
      latitude: 46.4312,
      longitude: 6.9107,
      deletedAt: null,
      createdAt: "2026-08-10T15:27:00Z",
      updatedAt: "2026-08-10T15:27:00Z",
    },
    {
      id: 2,
      travelId: 1,
      position: 2,
      nights: 2,
      localisation: "Interlaken",
      latitude: 46.6833,
      longitude: 7.85,
      deletedAt: null,
      createdAt: "2026-08-10T18:16:00Z",
      updatedAt: "2026-08-10T18:16:00Z",
    },
    {
      id: 3,
      travelId: 1,
      position: 3,
      nights: 2,
      localisation: "Zermatt",
      latitude: 46.0207,
      longitude: 7.7491,
      deletedAt: null,
      createdAt: "2026-08-10T18:19:00Z",
      updatedAt: "2026-08-10T18:19:00Z",
    },
  ];
}
