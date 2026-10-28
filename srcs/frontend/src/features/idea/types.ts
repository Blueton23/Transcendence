import type { DateRange } from "@daypicker/react";

export type IdeaApiType = "r" | "l" | "a" | "s";

// Décrit une idée telle qu’elle arrive dans le JSON de l’API
export interface IdeaApiResponse {
  id: number;
  travelId: number;
  travelerId: number;
  stepId: number | null;
  chosenById: number | null;
  title: string;
  type: IdeaApiType;
  status: IdeaStatus;
  voteCount: number;
  voted: boolean;
  localisation: string;
  note: string;
  url: string;
  latitude: string | null;
  longitude: string | null;
  pricePerNight: string | null;
  startDate: string | null;
  endDate: string | null;
  chosenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// "idea.created" / "idea.updated" socket events: "voted" depends on the
// reader, so the server leaves it out.
export type SocketIdea = Omit<IdeaApiResponse, "voted">;

// "reaction.created" / "reaction.deleted" socket events
export interface SocketReaction {
  ideaId: number;
  travelerId: number;
  voteCount: number;
}

// Données envoyées à l’API pour créer une idée
export interface CreateIdeaApiInput {
  title: string;
  type: IdeaApiType;
  stepId: number | null;
  localisation: string;
  note: string;
  url: string;
  latitude: number | null;
  longitude: number | null;
  pricePerNight: number | null;
  startDate: string | null;
  endDate: string | null;
}

/*================================================================================*/

export type IdeaType =
  "restaurant" | "accommodation" | "activity" | "sightseeing";
export type IdeaStatus = "suggested" | "placed" | "chosen";

export type IdeaFilter = "all" | IdeaType;
export type StepFilter = "all" | "none" | number;

// Représente une idée adaptée pour les composants du frontend
export interface Idea {
  id: number;
  travelId: number;
  travelerId: number;
  stepId: number | null;
  chosenBy: number | null;
  title: string;
  type: IdeaType;
  status: IdeaStatus;
  voteCount: number;
  voted: boolean;
  localisation: string | null;
  latitude: number | null;
  longitude: number | null;
  date: string | null;
  pricePerNight: number | null;
  arrivalDate: string | null;
  departureDate: string | null;
  url: string | null;
  note: string | null;
  chosenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Représente ce que l’utilisateur saisit dans la modal “Épingler une idée”
export interface CreateIdeaInput {
  title: string;
  type: IdeaType;
  stepId: number | null;
  localisation: string | null;
  latitude: number | null;
  longitude: number | null;
  date: string | null;
  pricePerNight: number | null;
  arrivalDate: string | null;
  departureDate: string | null;
  url: string | null;
  note: string | null;
}

// Représente ce que l’utilisateur saisit dans la modal “Placer”
export interface PlaceIdeaInput {
  stepId: number | null;
  date: string | null;
}

// Représente ce que l’utilisateur saisit dans la modal “Modifier”
export type EditIdeaInput = CreateIdeaInput;

// Représente les valeurs du formulaire dans les modals
export interface IdeaFormValues {
  stepId: number | null;
  type: IdeaType;
  title: string;
  url: string;
  note: string;
  pricePerNight: string;
  dateRange: DateRange | undefined;
}
