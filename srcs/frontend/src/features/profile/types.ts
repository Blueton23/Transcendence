import type { User } from "../auth/types";

export interface SignupData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  traveler: User;
}
