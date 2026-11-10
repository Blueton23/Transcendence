import { useState, useCallback } from "react";
import {
  useNotificationEvent,
  useNotificationSocketOpen,
} from "@/features/notifications/realtime/useNotificationSocket";
import { getFriendRequests } from "../api/friendship";
import type { FriendshipRequest } from "../types";

// Friend requests received and not answered yet. Reloaded on every
// friendship event, so the list stays live on any page.
export function useFriendRequests() {
  const [requests, setRequests] = useState<FriendshipRequest[]>([]);

  const refresh = useCallback(async () => {
    try {
      const result = await getFriendRequests();
      setRequests(result.requests);
    } catch (error) {
      console.error("Impossible de récupérer les demandes d'amis :", error);
    }
  }, []);

  useNotificationSocketOpen(() => void refresh());
  useNotificationEvent("friendship.requested", () => void refresh());
  useNotificationEvent("friendship.accepted", () => void refresh());
  useNotificationEvent("friendship.removed", () => void refresh());

  return requests;
}
