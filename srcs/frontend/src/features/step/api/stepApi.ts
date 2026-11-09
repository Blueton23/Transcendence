import type { Step, CreateStepData } from "@/features/step/types";
import i18n from "@/i18n";
import { getCookie } from "@/shared/api/cookies";
import { parseResponse } from "@/shared/api/parseResponse";

const API_BASE_URL = "/api";

export async function getSteps(travelId: number): Promise<Step[]> {
  const response = await fetch(`${API_BASE_URL}/travels/${travelId}/steps/`, {
    method: "GET",
    credentials: "include",
  });

  return parseResponse<Step[]>(response);
}

export async function createStep(
  travelId: number,
  data: CreateStepData,
): Promise<Step> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
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

  return parseResponse<Step>(response);
}

export async function updateStep(
  travelId: number,
  stepId: number,
  data: CreateStepData,
): Promise<Step> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(
    `${API_BASE_URL}/travels/${travelId}/steps/${stepId}/`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(data),
    },
  );

  return parseResponse<Step>(response);
}

export async function deleteStep(
  travelId: number,
  stepId: number,
): Promise<void> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(
    `${API_BASE_URL}/travels/${travelId}/steps/${stepId}/`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    },
  );

  if (!response.ok) {
    await parseResponse<unknown>(response);
  }
}
