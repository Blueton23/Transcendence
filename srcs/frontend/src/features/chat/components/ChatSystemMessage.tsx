import { useTranslation } from "react-i18next";

import Tag from "@/shared/ui/Tag";

import type { ChatMessage } from "../types";

interface ChatSystemMessageProps {
  message: ChatMessage;
}

// Neutral pill: joining or leaving the trip is information, not an error.
export default function ChatSystemMessage({ message }: ChatSystemMessageProps) {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center py-2">
      <Tag
        tone="plain"
        className="h-auto! min-h-6 max-w-full bg-surface-container py-1 text-center whitespace-normal! text-text-secondary"
      >
        {t(`chat.system.${message.systemKey}`, message.systemParams)}
      </Tag>
    </div>
  );
}
