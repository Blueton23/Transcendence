import Text from "../../../shared/ui/Text";
import type { ChatMessage as ChatMessageType } from "../types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.createdAt));

  return (
    <article className="flex flex-col items-start gap-1 py-2">
      <Text size="sm" tone="secondary">
        {message.author || "Ancien participant"} · {time}
      </Text>

      <div className="w-fit max-w-full rounded-lg bg-surface-container px-4 py-3">
        <Text>{message.body}</Text>
      </div>
    </article>
  );
}
