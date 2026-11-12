import {
  useNotificationEvent,
  useNotificationSocketOpen,
} from "@/features/notifications/realtime/useNotificationSocket";
import { getInvitations } from "@/features/travel/api/travelApi";
import type { InvitationNotification } from "@/features/travel/types";
import { toErrorMessage } from "@/shared/api/errors";
import { useState } from "react";

export function useInvitationNotifications() {
  const [notifications, setNotifications] = useState<InvitationNotification[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setNotifications(await getInvitations());
      setError(null);
    } catch (err) {
      setError(toErrorMessage(err));
    }
  }

  useNotificationSocketOpen(() => void refresh());
  useNotificationEvent("travel.invited", () => void refresh());

  return { notifications, error };
}
