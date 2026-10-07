import { useEffect, useState } from "react";

import type { FriendshipRequest } from "../types";
import {
  acceptFriendRequest,
  getFriendRequests,
  rejectFriendRequest,
} from "../api/friendship";

import Button from "@/shared/ui/Button";
import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import Icon from "@/shared/ui/Icon";

interface FriendRequestsProps {
  onFriendAccepted: () => void;
}

function FriendRequests({ onFriendAccepted }: FriendRequestsProps) {
  const [requests, setRequests] = useState<FriendshipRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function loadRequests() {
    try {
      const response = await getFriendRequests();
      setRequests(response.requests);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les demandes.",
      );
    }
  }

  useEffect(() => {
    void loadRequests();
  }, []);

  async function handleAccept(id: number) {
    setLoadingId(id);
    setError(null);

    try {
      await acceptFriendRequest(id);

      setRequests((current) => current.filter((request) => request.id !== id));

      onFriendAccepted();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'accepter la demande.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function handleReject(id: number) {
    setLoadingId(id);
    setError(null);

    try {
      await rejectFriendRequest(id);

      setRequests((current) => current.filter((request) => request.id !== id));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de rejeter la demande.",
      );
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Text tone="muted">
          DEMANDES RECUES · {requests.length > 0 && requests.length}
        </Text>
      </div>

      {error && <Text tone="accent">{error}</Text>}

      {requests.length === 0 ? (
        <Text tone="muted">Aucune demande d'amitié en attente.</Text>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => {
            const isLoading = loadingId === request.id;

            return (
              <div
                key={request.id}
                className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar user={request.traveler} />

                  <div className="flex min-w-0 flex-col">
                    <Text>{request.traveler.username}</Text>

                    <Text size="sm" tone="secondary">
                      {request.traveler.email}
                    </Text>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    icon={<Icon name="check" size={16} />}
                    variant="success"
                    disabled={isLoading}
                    onClick={() => void handleAccept(request.id)}
                  />

                  <Button
                    type="button"
                    icon={<Icon name="x" size={16} />}
                    variant="danger"
                    disabled={isLoading}
                    onClick={() => void handleReject(request.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FriendRequests;
