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
}

export interface ModifyProfileResponse {
  traveler: User;
}

export interface ModifyPasswordData {
  password: string;
}

export interface ModifyPasswordResponse {
  detail: string;
}