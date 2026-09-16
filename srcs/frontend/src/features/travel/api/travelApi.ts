import type { Travel } from "@/features/travel/types";
import { getCookie } from "@/shared/api/cookies";

const API_BASE_URL = "/api";

export async function getTravel(travelId: number): Promise<Travel> {
  const response = await fetch(`${API_BASE_URL}/travels/${travelId}/`, {
    method: "GET",
    credentials: "include",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "aucun voyage trouvé");
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
    throw new Error(result.message || "impossible de quitter le voyage");
  }
}
