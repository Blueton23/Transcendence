import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";

interface SecondaryInfoProps {
  pricePerNight: number | null;
  proposerName: string;
  proposerInitials: string;
}

export function SecondaryInfo({
  pricePerNight,
  proposerName,
  proposerInitials,
}: SecondaryInfoProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size="xs" color="2" className="shrink-0 md:size-7 md:text-xs">
        {proposerInitials}
      </Avatar>
      <Text tone="muted" size="sm" className="truncate">
        {proposerName}
        {pricePerNight !== null && ` · ${pricePerNight} CHF/nuit`}
      </Text>
    </div>
  );
}
