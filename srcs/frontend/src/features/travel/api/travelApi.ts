import type { Travel } from "@/features/travel/types";

// TODO(branchement): fonction en dur pour le moment. À terme : async, prend travelId en param, fetch réel et mapping API
// pour convertir les champs Decimal de DRF en number
export function getTravel(): Travel {
  return {
    id: 1,
    title: "Road trip Suisse",
    startDate: "2026-07-12",
    endDate: "2026-07-16",
    travelers: [
      { id: 1, initials: "CP", name: "Charlotte P." },
      { id: 2, initials: "DL", name: "Damien L." },
      { id: 3, initials: "SY", name: "Sofia Y." },
    ],
    inviteToken: "suisse-roadtrip-2026",
    status: "ouvert",
    createdAt: "2026-09-02T16:17:00Z",
    updatedAt: "2026-09-02T16:17:00Z",
  };
}
