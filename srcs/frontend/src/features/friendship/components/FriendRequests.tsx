import { useEffect, useState } from "react";

import type { FriendshipRequest } from "../types";
import {
  acceptFriendRequest,
  getFriendRequests,
  rejectFriendRequest,
} from "../api/friendship";

import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import Heading from "@/shared/ui/Heading";
import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import Badge from "@/shared/ui/Badge";
import Divider from "@/shared/ui/Divider";

function FriendRequests() {
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
    <Card variant="default" className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Heading level={2} size="md">
            Demandes d'amis reçues
          </Heading>

          <Text tone="secondary">
            Les personnes qui souhaitent rejoindre vos amis.
          </Text>
        </div>

        {requests.length > 0 && (
          <Badge variant="warning">{requests.length}</Badge>
        )}
      </div>

      <Divider />

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
                className="flex flex-col gap-4 rounded-md border border-border bg-surface-container p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar size="md">
                    {request.traveler.username.slice(0, 2).toUpperCase()}
                  </Avatar>

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
                    variant="primary"
                    disabled={isLoading}
                    onClick={() => void handleAccept(request.id)}
                  >
                    Accepter
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => void handleReject(request.id)}
                  >
                    Rejeter
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default FriendRequests;
