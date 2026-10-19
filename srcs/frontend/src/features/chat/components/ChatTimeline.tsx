import { Fragment } from "react";
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

  let previousDay: string | null = null;
  let unreadSeparatorShown = false;

  return (
    <div className="flex flex-col">
      {messages.map((message) => {
        const dayKey = getDayKey(message.createdAt);
        const showDate = dayKey !== previousDay;
        previousDay = dayKey;

        const showUnread = message.isUnread && !unreadSeparatorShown;

        if (showUnread) {
          unreadSeparatorShown = true;
        }

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
    </div>
  );
}
