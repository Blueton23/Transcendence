export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string | null;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  traveler: User;
}
