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

export interface ModifyProfileData {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  //SDU cf pour les autres data surtout password
}

export interface ModifyProfileResponse {
  traveler: User;
}
