import type { Travel } from "@/features/travel/types";
import { computeTravelDates } from "@/features/travel/utils/computeTravelDates";
import Text from "@/shared/ui/Text";
import { useTranslation } from "react-i18next";

export function TravelTitle({
  travel,
  inverse = false,
}: {
  travel: Travel;
  inverse?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex min-w-0 flex-col">
      <Text className={`truncate font-bold ${inverse ? "text-inverse!" : ""}`}>
        {travel.title}
      </Text>
      <Text
        size="sm"
        tone="secondary"
        className={inverse ? "text-inverse/75!" : ""}
      >
        {computeTravelDates(travel.startDate, travel.endDate)} ·{" "}
        {t("units.nights", { count: travel.nights })}
      </Text>
    </div>
  );
}
