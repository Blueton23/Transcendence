import { useCallback, useState } from "react";
import { useMatch } from "react-router";

import { useAuth } from "@/features/auth/context/useAuth";
import {
  useTravelEvent,
  useTravelSocketOpen,
} from "@/features/travel/realtime/useTravelSocket";

import { fetchUnseenIdeasCount } from "../api/api.ideas";
import type { IdeaApiResponse } from "../types";
import i18n from "@/i18n";
import { useError } from "@/shared/context/useError";

// Badge of the trip nav
export function useUnseenIdeasCount(travelId: number): number {
  const [unseenCount, setUnseenCount] = useState(0);
  const { currentUser } = useAuth();
  const isOnIdeas = useMatch("/travel/:id/ideas") !== null;
  const { showError } = useError();

  const refresh = useCallback(async () => {
    try {
      setUnseenCount(await fetchUnseenIdeasCount(travelId));
    } catch {
      showError(i18n.t("idea.errors.unseenCountFailed"));
    }
  }, [travelId, showError]);

  useTravelSocketOpen(() => void refresh());

  useTravelEvent<IdeaApiResponse>("idea.created", (idea) => {
    if (idea.travelerId === currentUser?.id) return;
    if (!isOnIdeas) setUnseenCount((count) => count + 1);
  });

  // A new idea may have been deleted before being seen: ask the server.
  useTravelEvent("idea.deleted", () => {
    if (!isOnIdeas) void refresh();
  });

  // Leaving the ideas page: everything there was marked as seen.
  const [wasOnIdeas, setWasOnIdeas] = useState(isOnIdeas);
  if (wasOnIdeas !== isOnIdeas) {
    setWasOnIdeas(isOnIdeas);
    if (wasOnIdeas) setUnseenCount(0);
  }

  return isOnIdeas ? 0 : unseenCount;
}
