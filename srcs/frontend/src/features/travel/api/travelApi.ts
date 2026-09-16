import type { Travel } from "@/features/travel/types";
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
