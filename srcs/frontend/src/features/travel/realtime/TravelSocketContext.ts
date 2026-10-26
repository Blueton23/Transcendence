import { createContext } from "react";

export interface TravelEvent<T = unknown> {
  type: string;
  payload: T;
}

export type TravelEventHandler<T = unknown> = (payload: T) => void;

export type TravelSocketStatus = "connecting" | "open" | "closed" | "forbidden";

export interface TravelSocketContextType {
  status: TravelSocketStatus;
  subscribe: (type: string, handler: TravelEventHandler) => () => void;
}

export const TravelSocketContext = createContext<
  TravelSocketContextType | undefined
>(undefined);
