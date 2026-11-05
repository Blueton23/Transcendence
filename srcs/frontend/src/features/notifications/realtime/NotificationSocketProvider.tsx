import type { ReactNode } from "react";

import { useEventSocket } from "@/shared/realtime/eventSocket";

import { NotificationSocketContext } from "./NotificationSocketContext";

// Mounted for logged-in pages only: logging out unmounts it, which closes
// the socket.
export function NotificationSocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const socket = useEventSocket("/ws/notifications/");

  return (
    <NotificationSocketContext.Provider value={socket}>
      {children}
    </NotificationSocketContext.Provider>
  );
}
