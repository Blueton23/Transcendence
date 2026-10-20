import Heading from "@/shared/ui/Heading";
import Badge from "@/shared/ui/Badge";

interface ChatHeaderProps {
  unreadCount: number;
}

export default function ChatHeader({ unreadCount }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-5 py-4">
      <Heading level={1} size="lg">
        Discussion
      </Heading>

      {unreadCount > 0 && (
        <Badge variant="warning">{unreadCount} non lus</Badge>
      )}
    </header>
  );
}
