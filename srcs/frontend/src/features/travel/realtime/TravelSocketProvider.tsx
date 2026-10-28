import type { ReactNode } from "react";

import { useEventSocket } from "@/shared/realtime/eventSocket";

import { TravelSocketContext } from "./TravelSocketContext";

interface TravelSocketProviderProps {
  travelId: number;
  children: ReactNode;
}

export function TravelSocketProvider({
  travelId,
  children,
}: TravelSocketProviderProps) {
  const isValid = Number.isSafeInteger(travelId) && travelId > 0;
  const socket = useEventSocket(isValid ? `/ws/travels/${travelId}/` : null);

  return (
    <TravelSocketContext.Provider value={socket}>
      {children}
    </TravelSocketContext.Provider>
  );
}
