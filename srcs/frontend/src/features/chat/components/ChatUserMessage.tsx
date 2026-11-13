import Avatar, { type AvatarColor } from "@/shared/ui/Avatar";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

import type { ChatMessage as ChatMessageType } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
  currentUserId: number | null;
  color: AvatarColor;
}

export default function ChatUserMessage({
  message,
  currentUserId,
  color,
}: ChatMessageProps) {
  const { t, i18n } = useTranslation();

  const time = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? "fr", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.createdAt));

  const isOwnMessage =
    currentUserId !== null && message.traveler === currentUserId;

  const author =
    message.traveler === null ? t("chat.formerParticipant") : message.author;

  if (isOwnMessage) {
    return (
      <article className="flex flex-col items-end gap-1 py-1.5">
        <Text size="sm" tone="muted">
          {time}
        </Text>
        <div className="max-w-[80%] rounded-lg rounded-br-sm bg-brand-dark px-4 py-2.5 wrap-anywhere md:max-w-[62%]">
          <Text size="md" className="text-inverse!">
            {message.body}
          </Text>
        </div>
      </article>
    );
  }
  return (
    <article className="flex items-end gap-2 py-1.5">
      <Avatar user={message.user} size="sm" color={color}>
        {author.slice(0, 2).toUpperCase()}
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <Text size="sm" tone="muted">
          <span className="font-semibold text-text">{author}</span> · {time}
        </Text>
        <div className="max-w-[80%] rounded-lg rounded-bl-sm border border-border bg-surface px-4 py-2.5 wrap-anywhere md:max-w-[62%]">
          <Text size="md">{message.body}</Text>
        </div>
      </div>
    </article>
  );
}
