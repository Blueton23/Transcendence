import Text from "@/shared/ui/Text";
import Avatar, { type AvatarColor } from "@/shared/ui/Avatar";

interface SecondaryInfoProps {
  proposerName: string;
  proposerInitials: string;
  color: AvatarColor;
}

export function SecondaryInfo({
  proposerName,
  proposerInitials,
  color,
}: SecondaryInfoProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size="xs" color={color} className="shrink-0 md:size-7 md:text-xs">
        {proposerInitials}
      </Avatar>
      <Text tone="muted" size="sm" className="truncate">
        {proposerName}
      </Text>
    </div>
  );
}
