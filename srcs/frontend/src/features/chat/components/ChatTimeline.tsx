import { Fragment, useEffect, useRef } from "react";
import type { ChatMessage as ChatMessageType } from "../types";
import ChatDateSeparator from "./ChatDateSeparator";
import ChatMessage from "./ChatMessage";
import ChatSystemMessage from "./ChatSystemMessage";
import UnreadSeparator from "./UnreadSeparator";

interface ChatTimelineProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  error: string | null;
}

function getDayKey(date: string) {
  const value = new Date(date);

  return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;
}

export default function ChatTimeline({
  messages,
  isLoading,
  error,
}: ChatTimelineProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  }, [messages, isLoading]);
  
  if (isLoading) {
    return (
      <p className="p-5 text-sm text-text-secondary">
        Chargement des messages…
      </p>
    );
  }

  if (error) {
    return <p className="p-5 text-sm text-text-secondary">{error}</p>;
  }

  const firstUnreadIndex = messages.findIndex(
    (message) => message.isUnread,
  );

  return (
    <div className="flex flex-col">
      {messages.map((message, index) => {
        const dayKey = getDayKey(message.createdAt);
        const previousMessage = messages[index - 1];

        const showDate =
          !previousMessage ||
          getDayKey(previousMessage.createdAt) !== dayKey;

        const showUnread = index === firstUnreadIndex;

        return (
          <Fragment key={message.id}>
            {showUnread && <UnreadSeparator />}

            {showDate && <ChatDateSeparator date={message.createdAt} />}

            {message.type === "system" ? (
              <ChatSystemMessage body={message.body} />
            ) : (
              <ChatMessage message={message} />
            )}
          </Fragment>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}