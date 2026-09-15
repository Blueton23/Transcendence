import type { Step } from "@/features/step/types";

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
