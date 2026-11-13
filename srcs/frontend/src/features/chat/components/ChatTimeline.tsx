import { Fragment } from "react";
import type { ChatMessage } from "../types";

import { useAuth } from "@/features/auth/context/useAuth";
import Text from "@/shared/ui/Text";

import ChatDateSeparator from "./ChatDateSeparator";
import ChatUserMessage from "./ChatUserMessage";
import ChatSystemMessage from "./ChatSystemMessage";
import UnreadSeparator from "./ChatUnreadSeparator";
import { useTranslation } from "react-i18next";
import type { TravelerSummary } from "@/features/travel/types";
import { getAvatarColor } from "@/shared/utils/getAvatarColors";

interface ChatTimelineProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  travelers: TravelerSummary[];
}

function getDayKey(date: string) {
  const value = new Date(date);
  return `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;
}

export default function ChatTimeline({
  messages,
  isLoading,
  error,
  travelers,
}: ChatTimelineProps) {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="p-5">
        <Text tone="secondary" size="sm">
          {t("chat.loading")}
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5" role="alert">
        <Text tone="accent" size="sm" className="whitespace-pre-line">
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
              <ChatSystemMessage message={message} />
            ) : (
              <ChatUserMessage
                message={message}
                currentUserId={currentUser?.id ?? null}
                color={
                  message.traveler === null
                    ? "pending"
                    : getAvatarColor(travelers, message.traveler)
                }
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
