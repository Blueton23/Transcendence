import { createContext } from "react";

import type { EventSocket } from "@/shared/realtime/eventSocket";

// Personal socket of the logged-in user (ws/notifications/), open on every
// page of the app: friend requests for now.
export const NotificationSocketContext = createContext<EventSocket | undefined>(
  undefined,
);
