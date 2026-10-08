import type {
  FriendshipListResponse,
  FriendshipRequestResponse,
  FriendshipRequestsResponse,
  FriendshipSearchResponse,
} from "../types";

import { getCookie } from "@/shared/api/cookies";
import { parseResponse } from "@/shared/api/errors";

const API_BASE_URL = "/api";

export async function searchFriend(
  query: string,
): Promise<FriendshipSearchResponse> {
  const response = await fetch(
    `${API_BASE_URL}/friendships/search/?q=${encodeURIComponent(query)}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  return parseResponse<FriendshipSearchResponse>(response);
}

export async function sendFriendRequest(
  userId: number,
): Promise<FriendshipRequestResponse> {
  const csrfToken = getCookie("csrftoken");
  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const response = await fetch(`${API_BASE_URL}/friendships/request/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify({
      user_id: userId,
    }),
  });

  return parseResponse<FriendshipRequestResponse>(response);
}

export async function getFriendRequests(): Promise<FriendshipRequestsResponse> {
  const response = await fetch(`${API_BASE_URL}/friendships/requests/`, {
    method: "GET",
    credentials: "include",
  });

  return parseResponse<FriendshipRequestsResponse>(response);
}

export async function acceptFriendRequest(friendshipId: number): Promise<void> {
  const csrfToken = getCookie("csrftoken");
  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const response = await fetch(
    `${API_BASE_URL}/friendships/${friendshipId}/accept/`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    },
  );

  await parseResponse(response);
}

export async function removeFriendRequest(friendshipId: number): Promise<void> {
  const csrfToken = getCookie("csrftoken");
  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const response = await fetch(
    `${API_BASE_URL}/friendships/${friendshipId}/remove/`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    },
  );

  await parseResponse(response);
}

export async function getFriends(): Promise<FriendshipListResponse> {
  const response = await fetch(`${API_BASE_URL}/friendships/`, {
    method: "GET",
    credentials: "include",
  });

  return parseResponse<FriendshipListResponse>(response);
}
