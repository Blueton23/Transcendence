import type { Step, CreateStepData } from "@/features/step/types";
import { getCookie } from "@/shared/api/cookies";
import { getApiErrorMessage } from "@/shared/api/errors";

const API_BASE_URL = "/api";

export async function getSteps(travelId: number): Promise<Step[]> {
  const response = await fetch(`${API_BASE_URL}/travels/${travelId}/steps/`, {
    method: "GET",
    credentials: "include",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(getApiErrorMessage(result) || "aucune étape enregistrée");
  }
  return result;
}

export async function createStep(
  travelId: number,
  data: CreateStepData,
): Promise<Step> {
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
    throw new Error(
      getApiErrorMessage(result) || "impossible de créer l'étape",
    );
  }
  return result;
}

export async function deleteStep(
  travelId: number,
  stepId: number,
): Promise<void> {
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
    throw new Error(
      getApiErrorMessage(result) || "impossible de supprimer l'étape",
    );
  }
}
