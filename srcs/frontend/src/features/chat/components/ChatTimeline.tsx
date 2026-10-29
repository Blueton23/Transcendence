import { Fragment } from "react";
import type { ChatMessage } from "../types";

import { useAuth } from "@/features/auth/context/useAuth";
import Text from "@/shared/ui/Text";

import ChatDateSeparator from "./ChatDateSeparator";
import ChatUserMessage from "./ChatUserMessage";
import ChatSystemMessage from "./ChatSystemMessage";
import UnreadSeparator from "./ChatUnreadSeparator";

interface ChatTimelineProps {
  messages: ChatMessage[];
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
  const { currentUser } = useAuth();

  if (isLoading) {
    return (
      <div className="p-5">
        <Text tone="secondary" size="sm">
          Chargement des messages…
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <Text tone="accent" size="sm">
          {error}
        </Text>
      </div>
    );
  }

  const firstUnreadIndex = messages.findIndex((message) => message.isUnread);

  return (
    <div className="flex flex-col px-4">
      {messages.map((message, index) => {
        const dayKey = getDayKey(message.createdAt);
        const previousMessage = messages[index - 1];

        const showDate =
          !previousMessage || getDayKey(previousMessage.createdAt) !== dayKey;

        const showUnread = index === firstUnreadIndex;

        return (
          <Fragment key={message.id}>
            {showUnread && <UnreadSeparator />}

            {showDate && <ChatDateSeparator date={message.createdAt} />}

            {message.type === "system" ? (
              <ChatSystemMessage body={message.body} />
            ) : (
              <ChatUserMessage
                message={message}
                currentUserId={currentUser?.id ?? null}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
