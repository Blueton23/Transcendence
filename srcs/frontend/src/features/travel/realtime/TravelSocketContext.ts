import { createContext } from "react";

import type { EventSocket } from "@/shared/realtime/eventSocket";

// Socket of the trip being viewed (ws/travels/<id>/): ideas, steps, votes,
// chat and participants.
export const TravelSocketContext = createContext<EventSocket | undefined>(
  undefined,
);
