import type {
    CreateTravelerData,
    CreateTravelerResponse,
    UpdateTravelerData,
    UpdateTravelerResponse,
  } from "../types";
  
  const API_BASE_URL = "/api";
  
  export async function createTraveler(
    data: CreateTravelerData,
  ): Promise<CreateTravelerResponse> {
    const response = await fetch(`${API_BASE_URL}/travelers/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      let message = "Impossible de créer le profil.";
  
      try {
        const errorData = await response.json();
  
        if (errorData.detail) {
          message = errorData.detail;
        } else if (errorData.error) {
          message = errorData.error;
        }
      } catch {
        // Le backend n'a pas renvoyé de JSON.
      }
  
      throw new Error(message);
    }
  
    return response.json();
  }

  export async function updateTraveler(
    id: number,
    data: UpdateTravelerData,
  ): Promise<UpdateTravelerResponse> {
    const response = await fetch(`${API_BASE_URL}/travelers/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      let message = "Impossible de modifier le profil.";
  
      try {
        const errorData = await response.json();
  
        if (errorData.detail) {
          message = errorData.detail;
        } else if (errorData.error) {
          message = errorData.error;
        }
      } catch {
        // Le backend n'a pas renvoyé de JSON.
      }
  
      throw new Error(message);
    }
  
    return response.json();
  }