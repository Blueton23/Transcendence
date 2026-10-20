import Avatar from "@/shared/ui/Avatar";
import Text from "@/shared/ui/Text";
import type { ChatMessage as ChatMessageType } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
  currentUserId: number | null;
}

export default function ChatUserMessage({
  message,
  currentUserId,
}: ChatMessageProps) {
  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.createdAt));

  const isOwnMessage =
    currentUserId !== null && message.traveler === currentUserId;

  return (
    <article
      className={`flex gap-3 py-2 ${isOwnMessage ? "flex-row-reverse" : ""}`}
    >
      <Avatar user={message.author} />

      <div
        className={`flex max-w-[80%] min-w-0 flex-col gap-1 ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        <Text size="sm" tone="secondary">
          {message.author || "Ancien participant"} · {time}
        </Text>

        <div
          className={`rounded-lg px-4 py-3 [overflow-wrap:anywhere] ${
            isOwnMessage
              ? "border border-border-control bg-surface-raised text-white"
              : "bg-surface-container"
          }`}
        >
          <Text>{message.body}</Text>
        </div>
      </div>
    </article>
  );
}
