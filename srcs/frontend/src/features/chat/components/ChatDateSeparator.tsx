import Text from "@/shared/ui/Text";
import Divider from "@/shared/ui/Divider";

interface ChatDateSeparatorProps {
  date: string;
}

export default function ChatDateSeparator({ date }: ChatDateSeparatorProps) {
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

  return (
    <div className="flex items-center gap-3 py-4">
      <div className="flex-1">
        <Divider />
      </div>

      <Text tone="muted" size="sm">
        {formattedDate}
      </Text>

      <div className="flex-1">
        <Divider />
      </div>
    </div>
  );
}
