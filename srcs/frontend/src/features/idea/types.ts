export type IdeaType =
  "restaurant" | "accommodation" | "activity" | "sightseeing";
export type IdeaStatus = "proposed" | "selected" | "reserved";

export interface Idea {
  id: number;
  travel_id: number;
  traveler_id: number;
  step_id: number | null;
  chosen_by: number | null;
  title: string;
  type: IdeaType;
  status: IdeaStatus;
  localisation: string | null;
  latitude: number | null;
  longitude: number | null;
  price_per_night: number | null;
  arrival_date: string | null;
  departure_date: string | null;
  chosen_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}
