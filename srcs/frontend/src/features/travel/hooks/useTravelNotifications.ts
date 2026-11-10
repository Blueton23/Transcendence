import { useCallback, useState } from "react";
import {
  useNotificationEvent,
  useNotificationSocketOpen,
} from "@/features/notifications/realtime/useNotificationSocket";
import { getTravelNotifications } from "@/features/travel/api/travelApi";
import type { TravelNotification } from "@/features/travel/types";
import i18n from "@/i18n";

// Unread messages and unseen ideas per travel. Reloaded whenever another
// member posts in one of my travels, so the list stays live on any page.
export function useTravelNotifications() {
  const [notifications, setNotifications] = useState<TravelNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setNotifications(await getTravelNotifications());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : i18n.t("errors.generic"));
    }
  }, []);

  useNotificationSocketOpen(() => void refresh());
  useNotificationEvent("travel.activity", () => void refresh());

  return { notifications, error };
}
