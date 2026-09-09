import type { User } from "../auth/types";

export interface CreateTravelerData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

export interface UpdateTravelerData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

export interface CreateTravelerResponse {
  traveler: User;
}

export interface UpdateTravelerResponse {
  traveler: User;
}
