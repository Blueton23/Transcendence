import type { CreateTravelData, Travel } from "@/features/travel/types";
import { getCookie } from "@/shared/api/cookies";
import { getApiErrorMessage } from "@/shared/api/errors";

const API_BASE_URL = "/api";

export async function getTravel(travelId: number): Promise<Travel> {
  const response = await fetch(`${API_BASE_URL}/travels/${travelId}/`, {
    method: "GET",
    credentials: "include",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(getApiErrorMessage(result) || "aucun voyage trouvé");
  }
  return result;
}

export async function getTravels(): Promise<Travel[]> {
  const response = await fetch(`${API_BASE_URL}/travels/`, {
    method: "GET",
    credentials: "include",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(getApiErrorMessage(result) || "aucun voyage trouvé");
  }
  return result;
}

export async function createTravel(data: CreateTravelData): Promise<Travel> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
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

  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(result) || "impossible de créer le voyage",
    );
  }
  return result;
}

export async function getInvitation(
  token: string,
): Promise<Travel & { isMember: boolean }> {
  const response = await fetch(`${API_BASE_URL}/travels/join/${token}/`, {
    method: "GET",
    credentials: "include",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(getApiErrorMessage(result) || "le voyage n'existe pas");
  }
  return result;
}

export async function joinTravel(token: string): Promise<Travel> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const response = await fetch(`${API_BASE_URL}/travels/join/${token}/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(result) || "impossible de rejoindre le voyage",
    );
  }
  return result;
}

export async function leaveTravel(travelId: number): Promise<void> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
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
    const result = await response.json();
    throw new Error(
      getApiErrorMessage(result) || "impossible de quitter le voyage",
    );
  }
}
