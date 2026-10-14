import { useEffect, useRef, useState } from "react";

import type { Friendship } from "../types";
import { getFriends, removeFriendRequest } from "../api/friendship";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";

import Button from "@/shared/ui/Button";
import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import Icon from "@/shared/ui/Icon";

interface FriendListProps {
  refreshKey: number;
}

function FriendList({ refreshKey }: FriendListProps) {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const friendshipId = useRef<number | null>(null);

  const {
    submit: submitRemove,
    isSubmitting,
    error: removeError,
  } = useSubmitAction(async () => {
    return removeFriendRequest(friendshipId.current);
  });

  const displayedError = error || removeError;

  useEffect(() => {
    async function loadFriends() {
      const response = await getFriends();
      setFriendships(response.friendships);
      setError(null);
    }
    void loadFriends();
  }, [refreshKey]);

  async function handleRemove(id: number) {
    friendshipId.current = id;
    const result = await submitRemove();
    if (result.success) {
      setFriendships((current) =>
        current.filter((friendship) => friendship.friendshipId !== id),
      );
      setConfirmingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Text tone="muted">
          MES AMIS · {friendships.length > 0 && friendships.length}
        </Text>
      </div>

      {displayedError && <Text tone="accent">{displayedError}</Text>}

      {friendships.length === 0 ? (
        <Text tone="muted">Vous n'avez pas encore d'amis.</Text>
      ) : (
        <div className="grid gap-3">
          {friendships.map((friendship) => {
            const friend = friendship.friend;
            const isConfirming = confirmingId === friendship.friendshipId;

            return (
              <div
                key={friendship.friendshipId}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-container p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar user={friend} profile />

                  <div className="flex min-w-0 flex-col">
                    <Text>{friend.username}</Text>
                    <Text>{friend.email}</Text>
                  </div>
                </div>

                {!isConfirming ? (
                  <Button
                    type="button"
                    icon={<Icon name="trash" size={16} />}
                    variant="danger"
                    onClick={() => setConfirmingId(friendship.friendshipId)}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Text size="sm">
                      Retirer {friend.username} de vos amis ?
                    </Text>

                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isSubmitting}
                      onClick={() => setConfirmingId(null)}
                    >
                      Annuler
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      disabled={isSubmitting}
                      onClick={() => void handleRemove(friendship.friendshipId)}
                    >
                      {isSubmitting ? "Retrait..." : "Retirer"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FriendList;
