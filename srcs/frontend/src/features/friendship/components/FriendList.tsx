import { useEffect, useState } from "react";

import type { User } from "@/features/auth/types";
import { getFriends } from "../api/friendship";

import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import Divider from "@/shared/ui/Divider";

function FriendList() {
  const [friends, setFriends] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFriends() {
      try {
        const response = await getFriends();
        setFriends(response.friends);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les amis.",
        );
      }
    }

    void loadFriends();
  }, []);

  return (
    <div variant="default" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Text tone="muted">
          MES AMIS · {friends.length > 0 && friends.length}
        </Text>
      </div>

      {error && <Text tone="accent">{error}</Text>}

      {friends.length === 0 ? (
        <Text tone="muted">Vous n'avez pas encore d'amis.</Text>
      ) : (
        <div className="grid gap-3">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-3 rounded-md border border-border bg-surface-container p-4"
            >
              <Avatar size="md">
                {friend.username.slice(0, 2).toUpperCase()}
              </Avatar>

              <div className="flex min-w-0 flex-col">
                <Text>{friend.username}</Text>
                <Text>{friend.email}</Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendList;
