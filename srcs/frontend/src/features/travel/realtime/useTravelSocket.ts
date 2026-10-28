import { useContext, useEffect, useEffectEvent } from "react";

import {
  TravelSocketContext,
  type TravelEventHandler,
} from "./TravelSocketContext";

export function useTravelSocket() {
  const context = useContext(TravelSocketContext);

  if (!context) {
    throw new Error(
      "useTravelSocket doit être utilisé dans un TravelSocketProvider",
    );
  }
  return context;
}

// The event hooks below do nothing outside a trip (no TravelSocketProvider),
// so shared hooks like useSteps also work on pages such as /travel.

export function useTravelEvent<T = unknown>(
  type: string,
  handler: TravelEventHandler<T>,
) {
  const subscribe = useContext(TravelSocketContext)?.subscribe;
  const onEvent = useEffectEvent((payload: unknown) => handler(payload as T));

  useEffect(() => subscribe?.(type, onEvent), [subscribe, type]);
}

// Runs on every (re)connection. The socket does not replay what was missed
// while it was closed, so this is where a hook reloads its data over REST.
export function useTravelSocketOpen(handler: () => void) {
  const status = useContext(TravelSocketContext)?.status;
  const onOpen = useEffectEvent(handler);

  useEffect(() => {
    if (status === "open") onOpen();
  }, [status]);
}
