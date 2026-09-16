import { getCsrfToken } from "@/features/auth/api/auth";
import type { Step, CreateStepData } from "@/features/step/types";
import { getCookie } from "@/shared/api/cookies";

const API_BASE_URL = "/api";

export async function getSteps(travelId: number): Promise<Step[]> {
  const response = await fetch(`${API_BASE_URL}/travels/${travelId}/steps/`, {
    method: "GET",
    credentials: "include",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "aucune étape enregistrée");
  }
  return result;
}

export async function createStep(
  travelId: number,
  data: CreateStepData,
): Promise<Step> {
  await getCsrfToken();

  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const response = await fetch(`${API_BASE_URL}/travels/${travelId}/steps/`, {
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
    throw new Error(result.message || "impossible de créer l'étape");
  }
  return result;
}

export async function deleteStep(
  travelId: number,
  stepId: number,
): Promise<void> {
  await getCsrfToken();

  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const response = await fetch(
    `${API_BASE_URL}/travels/${travelId}/steps/${stepId}/`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
    },
  );

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || "impossible de supprimer l'étape");
  }
}
