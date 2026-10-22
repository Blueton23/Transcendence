import { useContext, useEffect, useEffectEvent } from "react";

import { TravelSocketContext, TravelEventHandler } from "./TravelSocketContext";

export function useTravelSocket() {
  const context = useContext(TravelSocketContext);

  if (!context) {
    throw new Error(
      "useTravelSocket doit être utilisé dans un TravelSocketProvider",
    );
  }
  return context;
}

export function useTravelEvent<T = unknown>(
  type: string,
  handler: TravelEventHandler<T>,
) {
  const { subscribre } = useTravelSocket();
  const onEvent = useEffectEvent((payload: unknown) => handler(payload as T));

  useEffect(() => subscribre(type, onEvent), [subscribre, type]);
}
