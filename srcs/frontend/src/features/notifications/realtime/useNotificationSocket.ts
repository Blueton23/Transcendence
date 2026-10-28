import {
  useSocketEvent,
  useSocketOpen,
  type SocketEventHandler,
} from "@/shared/realtime/eventSocket";

import { NotificationSocketContext } from "./NotificationSocketContext";

export function useNotificationEvent<T = unknown>(
  type: string,
  handler: SocketEventHandler<T>,
) {
  useSocketEvent(NotificationSocketContext, type, handler);
}

// Runs on every (re)connection: reload over REST what may have been missed.
export function useNotificationSocketOpen(handler: () => void) {
  useSocketOpen(NotificationSocketContext, handler);
}
