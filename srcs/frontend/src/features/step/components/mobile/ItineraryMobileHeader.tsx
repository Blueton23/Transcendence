import type { ItineraryHeaderProps } from "@/features/step/components/page/ItineraryHeader";
import { ToggleMobileButton } from "@/features/step/components/mobile/ToggleMobileButton";
import Heading from "@/shared/ui/Heading";
import Tag from "@/shared/ui/Tag";
import { useTranslation } from "react-i18next";

export function ItineraryMobileHeader({
  steps,
  route,
  mobileView,
  onToggle,
}: Pick<ItineraryHeaderProps, "steps" | "route" | "mobileView" | "onToggle">) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 md:hidden">
      <div className="flex items-center justify-between">
        <Heading level={1} size="xl">
          {t("nav.itinerary")}
        </Heading>
        <ToggleMobileButton mobileView={mobileView} onToggle={onToggle} />
      </div>

      <div className="flex gap-2">
        <Tag size="md">{t("units.steps", { count: steps.length })}</Tag>
        <Tag size="md">
          {t("travel.kms", { count: route?.totalDistanceKm ?? 0 })}
        </Tag>
      </div>
    </div>
  );
}
