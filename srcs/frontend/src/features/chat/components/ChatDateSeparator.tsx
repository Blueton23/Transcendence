import Text from "../../../shared/ui/Text";

interface ChatDateSeparatorProps {
  date: string;
}

export default function ChatDateSeparator({
  date,
}: ChatDateSeparatorProps) {
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

  return (
    <div className="flex items-center gap-3 py-4">
      <div className="h-px flex-1 bg-border" />
      <Text tone="muted" size="sm">
        {formattedDate}
      </Text>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}