import type { Dispatch, SetStateAction } from "react";

import { useNotificationEvent } from "@/features/notifications/realtime/useNotificationSocket";
import type { Friendship, PresenceChangedEvent } from "../types";

// Keeps `friend.isOnline` live in a friend list: the backend sends
// `presence.changed` to every friend when someone opens their first tab or
// closes their last one. Missed events are covered by the REST reload the
// list already does on every (re)connection.
export function useFriendPresence(
  setFriendships: Dispatch<SetStateAction<Friendship[]>>,
) {
  useNotificationEvent<PresenceChangedEvent>(
    "presence.changed",
    ({ travelerId, isOnline }) => {
      setFriendships((current) =>
        current.map((friendship) =>
          friendship.friend.id === travelerId
            ? { ...friendship, friend: { ...friendship.friend, isOnline } }
            : friendship,
        ),
      );
    },
  );
}
