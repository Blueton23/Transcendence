import i18n from "@/i18n/index";
import { getCookie } from "@/shared/api/cookies";
import { parseResponse } from "@/shared/api/parseResponse";
import type {
  ApiChatMessage,
  CreateMessageData,
  UnreadCountResponse,
} from "../types";

const API_BASE_URL = "/api/travels";

export async function getMessages(travelId: number): Promise<ApiChatMessage[]> {
  const response = await fetch(`${API_BASE_URL}/${travelId}/messages/`, {
    method: "GET",
    credentials: "include",
  });

  return parseResponse<ApiChatMessage[]>(response);
}

export async function sendMessage(
  travelId: number,
  data: CreateMessageData,
): Promise<ApiChatMessage> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(`${API_BASE_URL}/${travelId}/messages/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
      "Accept-Language": i18n.language,
    },
    body: JSON.stringify(data),
  });

  return parseResponse<ApiChatMessage>(response);
}

export async function getUnreadCount(
  travelId: number,
): Promise<UnreadCountResponse> {
  const response = await fetch(
    `${API_BASE_URL}/${travelId}/messages/unread-count/`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  return parseResponse<UnreadCountResponse>(response);
}

export async function markMessagesAsRead(travelId: number): Promise<void> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(
    `${API_BASE_URL}/${travelId}/messages/mark-read/`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
        "Accept-Language": i18n.language,
      },
    },
  );

  await parseResponse<{ success: boolean }>(response);
}
