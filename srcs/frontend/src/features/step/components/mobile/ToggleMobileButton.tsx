import Button from "@/shared/ui/Button";
import type { ItineraryHeaderProps } from "@/features/step/components/page/ItineraryHeader";

export function ToggleMobileButton({
  mobileView,
  onToggle,
}: Pick<ItineraryHeaderProps, "mobileView" | "onToggle">) {
  return (
    <div className="inline-flex gap-1 self-start rounded-full bg-surface-container p-1 md:hidden">
      <Button
        className="px-2! py-1!"
        variant={mobileView === "list" ? "dark" : "ghost"}
        onClick={() => onToggle("list")}
        size="sm"
      >
        Liste
      </Button>
      <Button
        className="px-2! py-1!"
        variant={mobileView === "map" ? "dark" : "ghost"}
        onClick={() => onToggle("map")}
        size="sm"
      >
        Carte
      </Button>
    </div>
  );
}
