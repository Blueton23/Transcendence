import type { Travel } from "@/features/travel/types";

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
