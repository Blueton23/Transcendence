import { useCallback, useEffect, useState } from "react";
import {
  getMessages,
  sendMessage as postMessage,
  markMessagesAsRead,
} from "../api/chatApi";
import type { ApiChatMessage, ChatMessage } from "../types";

function toChatMessage(message: ApiChatMessage): ChatMessage {
  return {
    ...message,
    author: message.travelerName,
    type: message.isSystem ? "system" : "user",
  };
}

export function useChat(travelId: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshMessages = useCallback(async () => {
    const result = await getMessages(travelId);
    setMessages(result.map(toChatMessage));
  }, [travelId]);

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getMessages(travelId);

        if (!cancelled) {
          setMessages(result.map(toChatMessage));
        }

        await markMessagesAsRead(travelId);
      } catch {
        if (!cancelled) {
          setError("Impossible de charger les messages.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadMessages();

    const intervalId = window.setInterval(() => {
      void getMessages(travelId)
        .then((result) => {
          if (!cancelled) {
            setMessages(result.map(toChatMessage));
            setError(null);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setError("Impossible d'actualiser les messages.");
          }
        });
    }, 500000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [travelId]);

  const handleSendMessage = useCallback(
    async (body: string) => {
      const content = body.trim();
      if (!content) return;

      const result = await postMessage(travelId, { body: content });
      const newMessage = toChatMessage(result);

      setMessages((current) => {
        if (current.some((message) => message.id === newMessage.id)) {
          return current;
        }

        return [...current, newMessage].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime() ||
            a.id - b.id,
        );
      });
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
    refreshMessages,
  };
}