import {
  useNotificationEvent,
  useNotificationSocketOpen,
} from "@/features/notifications/realtime/useNotificationSocket";
import { getInvitations } from "@/features/travel/api/travelApi";
import type { InvitationNotification } from "@/features/travel/types";
import i18n from "@/i18n";
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
      setError(err instanceof Error ? err.message : i18n.t("errors.generic"));
    }
  }

  useNotificationSocketOpen(() => void refresh());
  useNotificationEvent("travel.invited", () => void refresh());

  return { notifications, error };
}
