import type {
  Idea,
  CreateIdeaInput,
  PlaceIdeaInput,
  EditIdeaInput,
  VoteIdea,
} from "@/features/idea/types";

// get -> permet de récupérer une idée
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
      status: "suggested",
      localisation: "12 rue des Alpes, Annecy",
      latitude: 45.899247,
      longitude: 6.129384,
      pricePerNight: null,
      arrivalDate: null,
      departureDate: null,
      url: null,
      note: null,
      chosenAt: null,
      createdAt: "2026-08-01T09:15:00Z",
      updatedAt: "2026-08-05T18:30:00Z",
    },

    {
      id: 2,
      travelId: 1,
      travelerId: 2,
      stepId: null,
      chosenBy: null,
      title: "Pont suspendu Charles Kuonen",
      type: "sightseeing",
      status: "suggested",
      localisation: "22 rue de la statut",
      latitude: 45.899247,
      longitude: 6.129384,
      pricePerNight: null,
      arrivalDate: null,
      departureDate: null,
      url: null,
      note: null,
      chosenAt: null,
      createdAt: "2026-08-01T09:15:00Z",
      updatedAt: "2026-08-05T18:30:00Z",
    },

    {
      id: 3,
      travelId: 1,
      travelerId: 2,
      stepId: 1,
      chosenBy: 2,
      title: "Rando du Bachalpsee",
      type: "activity",
      status: "placed",
      localisation: "15 rue des ponts",
      latitude: 45.899247,
      longitude: 6.129384,
      pricePerNight: null,
      arrivalDate: null,
      departureDate: null,
      url: null,
      note: null,
      chosenAt: "2026-08-05T18:30:00Z",
      createdAt: "2026-08-01T09:15:00Z",
      updatedAt: "2026-08-05T18:30:00Z",
    },

    {
      id: 4,
      travelId: 1,
      travelerId: 1,
      stepId: 2,
      chosenBy: 2,
      title: "Backpackers Zermatt",
      type: "accommodation",
      status: "chosen",
      localisation: "34 chemin du puit",
      latitude: 45.899247,
      longitude: 6.129384,
      pricePerNight: 48,
      arrivalDate: null,
      departureDate: null,
      url: null,
      note: null,
      chosenAt: "2026-08-05T18:30:00Z",
      createdAt: "2026-08-01T09:15:00Z",
      updatedAt: "2026-08-05T18:30:00Z",
    },
  ];
}

export function getIdeaVotes(): VoteIdea[] {
  return [
    {
      ideaId: 1,
      voteCount: 2,
      voted: false,
    },
    {
      ideaId: 2,
      voteCount: 4,
      voted: true,
    },
    {
      ideaId: 3,
      voteCount: 0,
      voted: false,
    },
    {
      ideaId: 4,
      voteCount: 1,
      voted: false,
    },
  ];
}

// les fonctions suivant sont a modifier plus tard pour la connexion backend

// fonction métier pour le bouton "Epingler une idée"
export function createIdea(input: CreateIdeaInput): Idea {
  return {
    id: Date.now(),
    travelId: 1,
    travelerId: 1,
    chosenBy: null,
    ...input,
    status: "suggested",
    chosenAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// fonction métier pour le bouton "placer"
export function placeIdea(ideaId: Idea["id"], input: PlaceIdeaInput) {
  console.log(ideaId, input);
}

export function deleteIdea(ideaId: Idea["id"]) {
  console.log(ideaId);
}

export function editIdea(ideaId: Idea["id"], input: EditIdeaInput) {
  console.log(ideaId, input);
}

// fonction métier pour le bouton de vote
export function voteIdea(ideaId: Idea["id"]) {
  console.log(ideaId);
}
