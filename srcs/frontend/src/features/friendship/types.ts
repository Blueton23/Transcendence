import type { User } from "../auth/types";

export interface FriendshipSearchResponse {
  traveler: User;
}

export interface FriendshipRequestResponse {
  friendship: number;
}

export interface FriendshipRequest {
  id: number;
  traveler: User;
  createdAt: string;
}

export interface FriendshipRequestsResponse {
  requests: FriendshipRequest[];
}

export interface FriendshipListResponse {
  friends: User[];
}
