export interface CreateTravelerData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
}

export interface UpdateTravelerData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
}

export interface Traveler {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture_url: string | null;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTravelerResponse {
  traveler: Traveler;
}

export interface UpdateTravelerResponse {
  traveler: Traveler;
}