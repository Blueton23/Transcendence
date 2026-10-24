import Text from "@/shared/ui/Text";
import Avatar from "@/shared/ui/Avatar";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size="xs" color="2" className="shrink-0 md:size-7 md:text-xs">
        {proposerInitials}
      </Avatar>
      <Text tone="muted" size="sm" className="truncate">
        {proposerName}
        {pricePerNight !== null &&
          ` · ${t("units.pricePerNight", { price: pricePerNight })}`}
      </Text>
    </div>
  );
}
