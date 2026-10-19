
import { getCookie } from "@/shared/api/cookies";
import { parseResponse } from "@/shared/api/errors";
import type { ApiChatMessage, CreateMessageData } from "../types";

const API_BASE_URL = "/api/travels";

export async function getMessages(
  travelId: number,
): Promise<ApiChatMessage[]> {
  const response = await fetch(
    `${API_BASE_URL}/${travelId}/messages/`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  return parseResponse<ApiChatMessage[]>(response);
}

export async function sendMessage(
  travelId: number,
  data: CreateMessageData,
): Promise<ApiChatMessage> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const response = await fetch(
    `${API_BASE_URL}/${travelId}/messages/`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(data),
    },
  );

  return parseResponse<ApiChatMessage>(response);
}
