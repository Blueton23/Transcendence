import { useEffect } from "react";

import { useAuth } from "@/features/auth/context/useAuth";
import { useTravelEvent } from "@/features/travel/realtime/useTravelSocket";

import { markIdeasAsSeen } from "../api/api.ideas";
import type { IdeaApiResponse } from "../types";
import i18n from "@/i18n";
import { useError } from "@/shared/context/useError";

function markAsSeen(travelId: number, showError: (message: string) => void) {
  markIdeasAsSeen(travelId).catch(() => {
    showError(i18n.t("idea.errors.markSeenFailed"));
  });
}

// For the ideas page: opening it marks the ideas as seen, and so does every
// idea added by someone else while the user is looking at it.
export function useMarkIdeasSeen(travelId: number) {
  const { currentUser } = useAuth();
  const { showError } = useError();

  useEffect(() => {
    markAsSeen(travelId, showError);
  }, [travelId, showError]);

  useTravelEvent<IdeaApiResponse>("idea.created", (idea) => {
    if (idea.travelerId !== currentUser?.id) markAsSeen(travelId, showError);
  });
}
