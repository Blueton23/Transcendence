import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/features/auth/context/useAuth";
import {
  useTravelEvent,
  useTravelSocketOpen,
} from "@/features/travel/realtime/useTravelSocket";

import {
  getMessages,
  sendMessage as postMessage,
  markMessagesAsRead,
} from "../api/chatApi";
import type { ApiChatMessage, ChatMessage, SocketChatMessage } from "../types";

function toChatMessage(message: ApiChatMessage): ChatMessage {
  return {
    ...message,
    author: message.travelerName,
    type: message.isSystem ? "system" : "user",
  };
}

function byDate(a: ChatMessage, b: ChatMessage) {
  return (
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
    a.id - b.id
  );
}

function addMessage(current: ChatMessage[], message: ChatMessage) {
  if (current.some((existing) => existing.id === message.id)) return current;
  return [...current, message].sort(byDate);
}

function markAsRead(travelId: number) {
  markMessagesAsRead(travelId).catch((error) => {
    console.error("Impossible de marquer les messages comme lus :", error);
  });
}

export function useChat(travelId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  // Set once the first list is shown: the unread separator comes from it.
  const hasLoaded = useRef(false);

  const applyMessages = useCallback(
    (result: ApiChatMessage[]) => {
      const fetched = result.map(toChatMessage);

      if (!hasLoaded.current) {
        hasLoaded.current = true;
        setMessages(fetched);
        markAsRead(travelId);
      } else {
        // A reload (socket reconnection) comes after mark-read, so the
        // server says everything is read: keep the separator where it was.
        setMessages((current) => {
          const previous = new Map(current.map((m) => [m.id, m.isUnread]));
          return fetched.map((m) => ({
            ...m,
            isUnread: previous.get(m.id) ?? false,
          }));
        });
      }
      setError(null);
      setIsLoading(false);
    },
    [travelId],
  );

  const onLoadError = useCallback((error: unknown) => {
    console.error("Erreur lors du chargement des messages :", error);
    if (!hasLoaded.current) setError("Impossible de charger les messages.");
    setIsLoading(false);
  }, []);

  const loadMessages = useCallback(
    () => getMessages(travelId).then(applyMessages, onLoadError),
    [travelId, applyMessages, onLoadError],
  );

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  // Catches up on anything sent while the socket was closed.
  useTravelSocketOpen(() => void loadMessages());

  useTravelEvent<SocketChatMessage>("chat.message", (event) => {
    // The user is looking at the chat: what arrives now is read.
    setMessages((current) =>
      addMessage(current, toChatMessage({ ...event, isUnread: false })),
    );
    if (event.traveler !== currentUser?.id) markAsRead(travelId);
  });

  const handleSendMessage = useCallback(
    async (body: string) => {
      const content = body.trim();
      if (!content) return;

      // The socket echoes it back too: addMessage drops the duplicate.
      const result = await postMessage(travelId, { body: content });
      setMessages((current) => addMessage(current, toChatMessage(result)));
    },
    [travelId],
  );

  const unreadCount = messages.filter((message) => message.isUnread).length;

  return {
    messages,
    unreadCount,
    isLoading,
    error,
    sendMessage: handleSendMessage,
    refreshMessages: loadMessages,
  };
}
