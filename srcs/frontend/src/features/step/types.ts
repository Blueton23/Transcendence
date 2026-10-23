export interface Step {
  id: number;
  travelId: number;
  startDate: string;
  endDate: string;
  nights: number;
  ideaCount: number;
  priority: number | null;
  localisation: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaActions {
  onVote: (id: number) => Promise<void>;
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<void>;
  onChoose: (id: number) => Promise<void>;
}

export interface Segment {
  durationMinutes: number;
  distanceKm: number;
}

export interface CreateStepData {
  startDate: string;
  endDate: string;
  localisation: string;
  latitude: number;
  longitude: number;
}
