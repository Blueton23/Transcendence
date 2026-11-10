import { useEffect } from "react";

import { useAuth } from "@/features/auth/context/useAuth";
import { useTravelEvent } from "@/features/travel/realtime/useTravelSocket";

import { markIdeasAsSeen } from "../api/api.ideas";
import type { IdeaApiResponse } from "../types";

function markAsSeen(travelId: number) {
  markIdeasAsSeen(travelId).catch((error) => {
    console.error("Impossible de marquer les idées comme vues :", error);
  });
}

// For the ideas page: opening it marks the ideas as seen, and so does every
// idea added by someone else while the user is looking at it.
export function useMarkIdeasSeen(travelId: number) {
  const { currentUser } = useAuth();

  useEffect(() => {
    markAsSeen(travelId);
  }, [travelId]);

  useTravelEvent<IdeaApiResponse>("idea.created", (idea) => {
    if (idea.travelerId !== currentUser?.id) markAsSeen(travelId);
  });
}
