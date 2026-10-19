import Heading from "../../../shared/ui/Heading";
import Text from "../../../shared/ui/Text";

interface ChatHeaderProps {
  unreadCount: number;
}

export default function ChatHeader({ unreadCount }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
      <Heading level={1} size="lg">
        Discussion
      </Heading>

      {unreadCount > 0 && (
        <Text tone="accent" size="sm">
          {unreadCount} non lus
        </Text>
      )}
    </header>
  );
}