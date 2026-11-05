import { useEffect, useState } from "react";
import { getTravelNotifications } from "@/features/travel/api/travelApi";
import type { TravelNotification } from "@/features/travel/types";

export function useTravelNotifications() {
  const [notifications, setNotifications] = useState<TravelNotification[]>([]);

  useEffect(() => {
    getTravelNotifications()
      .then(setNotifications)
      .catch((error) =>
        console.error("Impossible de récupérer les notifications :", error),
      );
  }, []);
  return notifications;
}
