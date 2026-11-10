import type {
  CreateTravelData,
  Invitation
  Travel,
  TravelNotification,
} from "@/features/travel/types";
import i18n from "@/i18n";
import { getCookie } from "@/shared/api/cookies";
import { parseResponse } from "@/shared/api/parseResponse";

const API_BASE_URL = "/api";

export async function getTravel(travelId: number): Promise<Travel> {
  const response = await fetch(`${API_BASE_URL}/travels/${travelId}/`, {
    method: "GET",
    credentials: "include",
  });

  return parseResponse<Travel>(response);
}

export async function getTravels(): Promise<Travel[]> {
  const response = await fetch(`${API_BASE_URL}/travels/`, {
    method: "GET",
    credentials: "include",
  });

  return parseResponse<Travel[]>(response);
}

export async function createTravel(data: CreateTravelData): Promise<Travel> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(`${API_BASE_URL}/travels/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(data),
  });

  return parseResponse<Travel>(response);
}

export async function updateTravel(
  travelId: number,
  data: CreateTravelData,
): Promise<Travel> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(`${API_BASE_URL}/travels/${travelId}/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(data),
  });

  return parseResponse<Travel>(response);
}

export async function getInvitation(token: string): Promise<Invitation> {
  const response = await fetch(`${API_BASE_URL}/travels/join/${token}/`, {
    method: "GET",
    credentials: "include",
  });

  return parseResponse<Invitation>(response);
}

export async function refuseInvitation(token: string): Promise<void> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(
    `${API_BASE_URL}/travels/join/${token}/refuse/`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
    },
  );

  if (!response.ok) {
    await parseResponse<unknown>(response);
  }
}

export async function joinTravel(token: string): Promise<Travel> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(`${API_BASE_URL}/travels/join/${token}/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
  });

  return parseResponse<Travel>(response);
}

export async function addParticipant(
  travelId: number,
  travelerId: number,
): Promise<void> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(
    `${API_BASE_URL}/travels/${travelId}/participants/`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ travelerId }),
    },
  );

  if (!response.ok) {
    await parseResponse<unknown>(response);
  }
}

export async function leaveTravel(travelId: number): Promise<void> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(`${API_BASE_URL}/travels/${travelId}/leave/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
  });

  if (!response.ok) {
    await parseResponse<unknown>(response);
  }
}

export async function getTravelNotifications(): Promise<TravelNotification[]> {
  const response = await fetch(`${API_BASE_URL}/travels/notifications/`, {
    method: "GET",
    credentials: "include",
  });

  return parseResponse<TravelNotification[]>(response);
}
