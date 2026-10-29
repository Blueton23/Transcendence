import { useCallback, useState } from "react";
import { useMatch } from "react-router";

import { useAuth } from "@/features/auth/context/useAuth";
import {
  useTravelEvent,
  useTravelSocketOpen,
} from "@/features/travel/realtime/useTravelSocket";

import { getUnreadCount } from "../api/chatApi";
import type { SocketChatMessage } from "../types";

// Badge of the trip nav. The server count is the truth (loaded on each socket
// (re)connection); live messages from others bump it in between. On the chat
// page itself everything is being read, so it shows 0.
export function useUnreadCount(travelId: number): number {
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();
  const isOnChat = useMatch("/travel/:id/chat") !== null;

  const refresh = useCallback(async () => {
    try {
      const result = await getUnreadCount(travelId);
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error(
        "Impossible de récupérer le nombre de messages non lus :",
        error,
      );
    }
  }, [travelId]);

  useTravelSocketOpen(() => void refresh());

  useTravelEvent<SocketChatMessage>("chat.message", (message) => {
    if (message.isSystem || message.traveler === currentUser?.id) return;
    if (!isOnChat) setUnreadCount((count) => count + 1);
  });

  // Leaving the chat: everything there was marked as read.
  const [wasOnChat, setWasOnChat] = useState(isOnChat);
  if (wasOnChat !== isOnChat) {
    setWasOnChat(isOnChat);
    if (wasOnChat) setUnreadCount(0);
  }

  return isOnChat ? 0 : unreadCount;
}
