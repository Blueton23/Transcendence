import { useState, useCallback } from "react";
import {
  useNotificationEvent,
  useNotificationSocketOpen,
} from "@/features/notifications/realtime/useNotificationSocket";
import { getFriendRequests } from "../api/friendship";
import type { FriendshipRequest } from "../types";
import i18n from "@/i18n";
import { useError } from "@/shared/context/useError";

// Friend requests received and not answered yet. Reloaded on every
// friendship event, so the list stays live on any page.
export function useFriendRequests() {
  const [requests, setRequests] = useState<FriendshipRequest[]>([]);
  const { showError } = useError();

  const refresh = useCallback(async () => {
    try {
      const result = await getFriendRequests();
      setRequests(result.requests);
    } catch {
      showError(i18n.t("friendship.errors.requestsLoadFailed"));
    }
  }, [showError]);

  useNotificationSocketOpen(() => void refresh());
  useNotificationEvent("friendship.requested", () => void refresh());
  useNotificationEvent("friendship.accepted", () => void refresh());
  useNotificationEvent("friendship.removed", () => void refresh());

  return requests;
}
