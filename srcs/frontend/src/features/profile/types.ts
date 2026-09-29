import type { User } from "../auth/types";

export interface SignupData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
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
  oldPassword: string;
  newPassword1: string;
  newPassword2: string;
}

export interface ModifyPasswordResponse {
  detail: string;
}

export interface ModifyProfilePictureResponse {
  traveler: User;
}
