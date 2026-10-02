import { useEffect, useState } from "react";

import type { User } from "@/features/auth/types";
import { getFriends } from "../api/friendship";

import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
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
    <Card variant="default" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Heading level={2} size="md">
          Liste des amis
        </Heading>

        <Text tone="secondary">
          Les personnes avec lesquelles vous êtes amis.
        </Text>
      </div>

      <Divider />

      {error && <Text tone="accent">{error}</Text>}

      {friends.length === 0 ? (
        <Text tone="muted">Vous n'avez pas encore d'amis.</Text>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
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

                <Text size="sm" tone="muted">
                  Ami
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default FriendList;
