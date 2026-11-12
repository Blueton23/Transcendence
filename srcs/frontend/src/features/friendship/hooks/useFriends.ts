import { getFriends } from "@/features/friendship/api/friendship";
import type { Friendship } from "@/features/friendship/types";
import { useNotificationSocketOpen } from "@/features/notifications/realtime/useNotificationSocket";
import i18n from "@/i18n";
import { useCallback, useState } from "react";

import { useFriendPresence } from "./useFriendPresence";

export function useFriends() {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    try {
      const response = await getFriends();
      setFriendships(response.friendships);
      setError(null);
    } catch {
      setError(i18n.t("friendship.errors.loadFailed"));
    }
  }, []);

  // Loaded on every (re)connection of the notification socket, which also
  // covers presence events missed while it was closed.
  useNotificationSocketOpen(() => void loadFriends());
  useFriendPresence(setFriendships);

  return { friendships, error };
}
