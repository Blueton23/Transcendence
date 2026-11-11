import Button from "@/shared/ui/Button";
import type { ItineraryHeaderProps } from "@/features/step/components/page/ItineraryHeader";
import { useTranslation } from "react-i18next";

export function ToggleMobileButton({
  mobileView,
  onToggle,
}: Pick<ItineraryHeaderProps, "mobileView" | "onToggle">) {
  const { t } = useTranslation();
  return (
    <div className="inline-flex gap-1 rounded-full bg-surface-container p-1 md:hidden">
      <Button
        variant={mobileView === "list" ? "dark" : "ghost"}
        onClick={() => onToggle("list")}
        size="sm"
      >
        {t("step.list")}
      </Button>
      <Button
        variant={mobileView === "map" ? "dark" : "ghost"}
        onClick={() => onToggle("map")}
        size="sm"
      >
        {t("step.map")}
      </Button>
    </div>
  );
}
