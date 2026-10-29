import {
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type Context,
} from "react";

// Shared by the server-to-client sockets (trip, notifications): every
// message is a `{ type, payload }` event, and the server only signals; the
// data itself is always reloaded over REST.

export interface SocketEvent<T = unknown> {
  type: string;
  payload: T;
}

export type SocketEventHandler<T = unknown> = (payload: T) => void;

export type SocketStatus = "connecting" | "open" | "closed" | "forbidden";

export interface EventSocket {
  status: SocketStatus;
  subscribe: (type: string, handler: SocketEventHandler) => () => void;
}

// Close codes sent by the backend (common/consumers.py): do not reconnect.
const CLOSE_NOT_AUTH = 4401;
const CLOSE_NOT_PARTICIPANT = 4403;

const MAX_RETRY_DELAY_MS = 30_000;

function socketUrl(path: string): string {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}${path}`;
}

// Opens `path` (null: stay closed), reconnects with backoff, and dispatches
// each event to the handlers subscribed to its type.
export function useEventSocket(path: string | null): EventSocket {
  const [status, setStatus] = useState<SocketStatus>(
    path ? "connecting" : "closed",
  );
  const listeners = useRef(new Map<string, Set<SocketEventHandler>>());

  const subscribe = useCallback((type: string, handler: SocketEventHandler) => {
    const map = listeners.current;
    if (!map.has(type)) map.set(type, new Set());
    map.get(type)!.add(handler);

    return () => {
      map.get(type)?.delete(handler);
    };
  }, []);

  useEffect(() => {
    if (!path) return;

    let socket: WebSocket | null = null;
    let retryTimer: number | undefined;
    let attempt = 0;
    let stopped = false;

    function connect() {
      socket = new WebSocket(socketUrl(path!));

      socket.onopen = () => {
        attempt = 0;
        setStatus("open");
      };

      socket.onmessage = (message) => {
        let event: SocketEvent;
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

      socket.onclose = (closeEvent) => {
        socket = null;
        if (stopped) return;

        if (
          closeEvent.code === CLOSE_NOT_AUTH ||
          closeEvent.code === CLOSE_NOT_PARTICIPANT
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
  }, [path]);

  return useMemo(() => ({ status, subscribe }), [status, subscribe]);
}

// The hooks below do nothing when the socket's provider is not mounted, so a
// shared hook (useSteps on /travel, for instance) works anywhere.

export function useSocketEvent<T = unknown>(
  context: Context<EventSocket | undefined>,
  type: string,
  handler: SocketEventHandler<T>,
) {
  const subscribe = useContext(context)?.subscribe;
  const onEvent = useEffectEvent((payload: unknown) => handler(payload as T));

  useEffect(() => subscribe?.(type, onEvent), [subscribe, type]);
}

// Runs on every (re)connection. The socket does not replay what was missed
// while it was closed, so this is where a hook reloads its data over REST.
export function useSocketOpen(
  context: Context<EventSocket | undefined>,
  handler: () => void,
) {
  const status = useContext(context)?.status;
  const onOpen = useEffectEvent(handler);

  useEffect(() => {
    if (status === "open") onOpen();
  }, [status]);
}
