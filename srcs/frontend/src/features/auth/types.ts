export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string | null;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SignupData {
  username: string;
  firstName: string;
  lastName: string;
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
