import type { Idea, CreateIdeaInput } from "../types";

//récupère plusieurs idées
export function getIdeas(): Idea[] {
  return [
    {
      id: 1,
      travelId: 1,
      travelerId: 1,
      stepId: null,
      chosenBy: null,
      title: "Fondue chez Chez Vrony",
      type: "restaurant",
      status: "proposed",
      localisation: "12 rue des Alpes, Annecy",
      latitude: 45.899247,
      longitude: 6.129384,
      pricePerNight: null,
      arrivalDate: null,
      departureDate: null,
      chosenAt: null,
      deletedAt: null,
      createdAt: "2026-08-01T09:15:00Z",
      updatedAt: "2026-08-05T18:30:00Z",
      url: null,
      note: null,
    },

    {
      id: 2,
      travelId: 1,
      travelerId: 2,
      stepId: null,
      chosenBy: null,
      title: "Pont suspendu Charles Kuonen",
      type: "sightseeing",
      status: "proposed",
      localisation: "22 rue de la statut",
      latitude: 45.899247,
      longitude: 6.129384,
      pricePerNight: null,
      arrivalDate: null,
      departureDate: null,
      chosenAt: null,
      deletedAt: null,
      createdAt: "2026-08-01T09:15:00Z",
      updatedAt: "2026-08-05T18:30:00Z",
      url: null,
      note: null,
    },

    {
      id: 3,
      travelId: 1,
      travelerId: 2,
      stepId: 1,
      chosenBy: 2,
      title: "Rando du Bachalpsee",
      type: "activity",
      status: "selected",
      localisation: "15 rue des ponts",
      latitude: 45.899247,
      longitude: 6.129384,
      pricePerNight: null,
      arrivalDate: null,
      departureDate: null,
      chosenAt: "2026-08-05T18:30:00Z",
      deletedAt: null,
      createdAt: "2026-08-01T09:15:00Z",
      updatedAt: "2026-08-05T18:30:00Z",
      url: null,
      note: null,
    },

    {
      id: 4,
      travelId: 1,
      travelerId: 1,
      stepId: 2,
      chosenBy: 2,
      title: "Backpackers Zermatt",
      type: "accommodation",
      status: "reserved",
      localisation: "34 chemin du puit",
      latitude: 45.899247,
      longitude: 6.129384,
      pricePerNight: 48,
      arrivalDate: null,
      departureDate: null,
      chosenAt: "2026-08-05T18:30:00Z",
      deletedAt: null,
      createdAt: "2026-08-01T09:15:00Z",
      updatedAt: "2026-08-05T18:30:00Z",
      url: null,
      note: null,
    },
  ];
}

// les fonctions suivant sont a modifier plus tard

// fonction métier pour le bouton de vote
export function voteIdea(ideaId: Idea["id"]) {
  console.log(ideaId);
}

// fonction métier pour le bouton "placer"
export function placeIdea(ideaId: Idea["id"], stepId: number) {
  console.log(ideaId, stepId);
}

// fonction métier pour le bouton "epingler une idée"
export function createIdea(input: CreateIdeaInput): Idea {
  return {
    id: Date.now(),
    travelId: 1,
    travelerId: 1,
    chosenBy: null,
    ...input,
    status: "proposed",
    chosenAt: null,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
