import { useEffect, useRef, useState } from "react";

import type { FriendshipRequest } from "../types";
import {
  acceptFriendRequest,
  getFriendRequests,
  removeFriendRequest,
} from "../api/friendship";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";

import Button from "@/shared/ui/Button";
import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";

interface FriendRequestsProps {
  refreshKey: number;
  onFriendAccepted: () => void;
}

function FriendRequests({ refreshKey, onFriendAccepted }: FriendRequestsProps) {
  const [requests, setRequests] = useState<FriendshipRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef<number | null>(null);
  const { t } = useTranslation();

  const {
    submit: submitAccept,
    isSubmitting: isAccepting,
    error: acceptError,
  } = useSubmitAction(async () => {
    if (requestId.current === null) {
      throw new Error(t("friendship.errors.missingRequestId"));
    }
    return acceptFriendRequest(requestId.current);
  });

  const {
    submit: submitReject,
    isSubmitting: isRejecting,
    error: rejectError,
  } = useSubmitAction(async () => {
    if (requestId.current === null) {
      throw new Error(t("friendship.errors.missingRequestId"));
    }
    return removeFriendRequest(requestId.current);
  });

  const isSubmitting = isAccepting || isRejecting;
  const displayedError = error || acceptError || rejectError;

  useEffect(() => {
    async function loadRequests() {
      const response = await getFriendRequests();
      setRequests(response.requests);
      setError(null);
    }
    void loadRequests();
  }, [refreshKey]);

  async function handleAccept(id: number) {
    requestId.current = id;
    const result = await submitAccept();
    if (result.success) {
      setRequests((current) => current.filter((request) => request.id !== id));
      onFriendAccepted();
    }
  }

  async function handleReject(id: number) {
    requestId.current = id;
    const result = await submitReject();
    if (result.success) {
      setRequests((current) => current.filter((request) => request.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <Text tone="muted">
          {t("friendship.receivedRequests")} ·{" "}
          {requests.length > 0 && requests.length}
        </Text>
      </div>
      {displayedError && <Text tone="accent">{displayedError}</Text>}
      {requests.length === 0 ? (
        <Text tone="muted">{t("friendship.noRequests")}</Text>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar user={request.traveler} profile />

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
                  disabled={isSubmitting}
                  onClick={() => void handleAccept(request.id)}
                >
                  {t("friendship.accept")}
                </Button>

                <Button
                  type="button"
                  icon={<Icon name="x" size={16} />}
                  variant="danger"
                  disabled={isSubmitting}
                  onClick={() => void handleReject(request.id)}
                >
                  {t("friendship.decline")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FriendRequests;
