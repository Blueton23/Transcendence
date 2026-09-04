export type IdeaType =
  "restaurant" | "accommodation" | "activity" | "sightseeing";
export type IdeaStatus = "proposed" | "selected" | "reserved";

export type IdeaFilter = "all" | IdeaType;
export type StepFilter = "all" | "none" | number;

//represente une idee complete cote backend
export interface Idea {
  id: number;
  travelId: number;
  travelerId: number;
  stepId: number | null;
  chosenBy: number | null;
  title: string;
  type: IdeaType;
  status: IdeaStatus;
  localisation: string | null;
  latitude: number | null;
  longitude: number | null;
  pricePerNight: number | null;
  arrivalDate: string | null;
  departureDate: string | null;
  chosenAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  url: string | null;
  note: string | null;
}

// Représente ce que l’utilisateur saisit dans la modal “Épingler une idée”
export interface CreateIdeaInput {
  title: string;
  type: IdeaType;
  stepId: number | null;
  localisation: string | null;
  latitude: number | null;
  longitude: number | null;
  pricePerNight: number | null;
  arrivalDate: string | null;
  departureDate: string | null;
  url: string | null;
  note: string | null;
}
