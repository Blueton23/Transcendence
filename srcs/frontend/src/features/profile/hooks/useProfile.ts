import { useState } from "react";
import { createTraveler } from "../api/profileApi";
import type { CreateTravelerData, Traveler } from "../types";

interface UseProfileReturn {
  createProfile: (data: CreateTravelerData) => Promise<Traveler | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useProfile(): UseProfileReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createProfile(
    data: CreateTravelerData,
  ): Promise<Traveler | null> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createTraveler(data);

      return response.traveler;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue.";

      setError(message);

      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function clearError() {
    setError(null);
  }

  return {
    createProfile,
    isLoading,
    error,
    clearError,
  };
}