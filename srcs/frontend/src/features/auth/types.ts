export interface User {
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

export interface SignupData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  traveler: User;
}

//a supprimer SDU
/*
export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}
*/