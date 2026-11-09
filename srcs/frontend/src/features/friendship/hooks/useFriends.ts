import { getFriends } from "@/features/friendship/api/friendship";
import type { Friendship } from "@/features/friendship/types";
import i18n from "@/i18n";
import { useEffect, useState } from "react";

export function useFriends() {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFriends() {
      try {
        const response = await getFriends();
        setFriendships(response.friendships);
      } catch {
        setError(i18n.t("friendship.errors.loadFailed"));
      }
    }
    void loadFriends();
  }, []);

  return { friendships, error };
}
