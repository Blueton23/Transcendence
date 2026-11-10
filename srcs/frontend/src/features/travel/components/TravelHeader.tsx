import { computeTravelDates } from "@/features/travel/utils/computeTravelDates";
import type { Travel } from "@/features/travel/types";
import Heading from "@/shared/ui/Heading";
import Tag from "@/shared/ui/Tag";
import Icon from "@/shared/ui/Icon";
import { useTranslation } from "react-i18next";
import { TravelOptionsButton } from "@/features/travel/components/TravelOptionsButton";

interface TravelHeaderProps {
  travel: Travel;
  totalKms: number;
}

export function TravelHeader({ travel, totalKms }: TravelHeaderProps) {
  const DatesLabel = computeTravelDates(travel.startDate, travel.endDate);
  const { t } = useTranslation();
  return (
    <div className="relative flex flex-col gap-3 rounded-md bg-linear-to-br from-[#3A3760] via-[#2B2A47] to-[#211F3A] p-6">
      <Heading level={1} size="lg" className="text-inverse!">
        {travel.title}
      </Heading>
      <div className="flex flex-nowrap gap-2">
        <Tag tone="inverse" className="border-error/80! bg-error/30!">
          {DatesLabel}
        </Tag>
        <Tag icon={<Icon name="moon" size={14} />} tone="inverse">
          {t("units.nights", { count: travel.nights })}
        </Tag>
        <Tag icon={<Icon name="car" size={14} />} tone="inverse">
          {t("travel.kms", { count: totalKms })}
        </Tag>
      </div>
      <div className="absolute top-4 right-4">
        <TravelOptionsButton travel={travel} />
      </div>
    </div>
  );
}
