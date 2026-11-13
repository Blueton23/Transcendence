import Heading from "@/shared/ui/Heading";
import Tag from "@/shared/ui/Tag";
import { useTranslation } from "react-i18next";

interface ChatHeaderProps {
  unreadCount: number;
}

export default function ChatHeader({ unreadCount }: ChatHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-5 py-4">
      <Heading level={1} size="xl">
        {t("chat.title")}
      </Heading>

      {unreadCount > 0 && (
        <Tag tone="plain" className="bg-warning-bg text-warning-text">
          {t("chat.unreadCount", { count: unreadCount })}
        </Tag>
      )}
    </header>
  );
}
