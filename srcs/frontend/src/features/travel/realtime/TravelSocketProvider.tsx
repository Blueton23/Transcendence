import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  TravelSocketContext,
  type TravelEvent,
  type TravelEventHandler,
  type TravelSocketStatus,
} from "./TravelSocketContext";

const CLOSE_NOT_AUTH = 4401;
const CLOSE_NOT_PARTICIPANT = 4403;

const MAX_RETRY_DELAY_MS = 30_000;

function travelSocketUrl(travelId: number): string {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/ws/travels/${travelId}/`;
}

interface TravelSocketProvideProps {
  travelId: number;
  children: ReactNode;
}

export function TravelSocketProvider({
  travelId,
  children,
}: TravelSocketProvideProps) {
  const isValid = Number.isSafeInteger(travelId) && travelId > 0;
  const [status, setStatus] = useState<TravelSocketStatus>(
    isValid ? "connecting" : "closed",
  );
  const listeners = useRef(new Map<string, Set<TravelEventHandler>>());

  const subscribe = useCallback((type: string, handler: TravelEventHandler) => {
    const map = listeners.current;
    if (!map.has(type)) map.set(type, new Set());
    map.get(type)!.add(handler);

    return () => {
      map.get(type)?.delete(handler);
    };
  }, []);

  useEffect(() => {
    if (!isValid) return;

    let socket: WebSocket | null = null;
    let retryTimer: number | undefined;
    let attempt = 0;
    let stopped = false;

    function connect() {
      socket = new WebSocket(travelSocketUrl(travelId));

      socket.onopen = () => {
        attempt = 0;
        setStatus("open");
      };

      socket.onmessage = (message) => {
        let event: TravelEvent;
        try {
          event = JSON.parse(message.data);
        } catch {
          return;
        }

        if (import.meta.env.DEV)
          console.info("[ws]", event.type, event.payload);

        listeners.current.get(event.type)?.forEach((handler) => {
          handler(event.payload);
        });
      };

      socket.onclose = (CloseEvent) => {
        socket = null;
        if (stopped) return;

        if (
          CloseEvent.code === CLOSE_NOT_AUTH ||
          CloseEvent.code === CLOSE_NOT_PARTICIPANT
        ) {
          setStatus("forbidden");
          return;
        }

        setStatus("closed");
        const delay = Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY_MS);
        attempt++;
        retryTimer = window.setTimeout(() => {
          setStatus("connecting");
          connect();
        }, delay);
      };
    }

    connect();

    return () => {
      stopped = true;
      window.clearTimeout(retryTimer);
      if (!socket) return;

      // Closing mid-handshake makes the browser log "connection interrupted"
      // (StrictMode does this on every mount in dev): close once open instead.
      const closing = socket;
      closing.onmessage = null;
      if (closing.readyState === WebSocket.CONNECTING) {
        closing.onopen = () => closing.close(1000);
      } else {
        closing.close(1000);
      }
    };
  }, [travelId, isValid]);

  const value = useMemo(() => ({ status, subscribe }), [status, subscribe]);

  return (
    <TravelSocketContext.Provider value={value}>
      {children}
    </TravelSocketContext.Provider>
  );
}
