import { useContext } from "react";

import {
  useSocketEvent,
  useSocketOpen,
  type SocketEventHandler,
} from "@/shared/realtime/eventSocket";

import { TravelSocketContext } from "./TravelSocketContext";

export function useTravelSocket() {
  const context = useContext(TravelSocketContext);

  if (!context) {
    throw new Error(
      "useTravelSocket doit être utilisé dans un TravelSocketProvider",
    );
  }
  return context;
}

// Both do nothing outside a trip (no TravelSocketProvider), so shared hooks
// like useSteps also work on pages such as /travel.

export function useTravelEvent<T = unknown>(
  type: string,
  handler: SocketEventHandler<T>,
) {
  useSocketEvent(TravelSocketContext, type, handler);
}

// Runs on every (re)connection: reload over REST what may have been missed.
export function useTravelSocketOpen(handler: () => void) {
  useSocketOpen(TravelSocketContext, handler);
}
