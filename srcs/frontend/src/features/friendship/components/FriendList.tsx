import { useEffect, useState } from "react";

import type { Friendship } from "../types";
import { getFriends } from "../api/friendship";

import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";

interface FriendListProps {
  refreshKey: number;
}

function FriendList({ refreshKey }: FriendListProps) {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFriends() {
      try {
        const response = await getFriends();
        setFriendships(response.friendships);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les amis.",
        );
      }
    }

    void loadFriends();
  }, [refreshKey]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Text tone="muted">
          MES AMIS · {friendships.length > 0 && friendships.length}
        </Text>
      </div>

      {error && <Text tone="accent">{error}</Text>}

      {friendships.length === 0 ? (
        <Text tone="muted">Vous n'avez pas encore d'amis.</Text>
      ) : (
        <div className="grid gap-3">
          {friendships.map((friendship) => {
            const friend = friendship.friend;

            return (
              <div
                key={friendship.friendshipId}
                className="flex items-center gap-3 rounded-md border border-border bg-surface-container p-4"
              >
                <Avatar user={friend} />

                <div className="flex min-w-0 flex-col">
                  <Text>{friend.username}</Text>
                  <Text>{friend.email}</Text>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FriendList;
