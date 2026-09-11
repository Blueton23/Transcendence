import Button from "@/shared/ui/Button";
import type { ItineraryHeaderProps } from "@/features/step/components/page/ItineraryHeader";

export function ToggleMobileButton({
  mobileView,
  onToggle,
}: Pick<ItineraryHeaderProps, "mobileView" | "onToggle">) {
  return (
    <div className="inline-flex gap-1 self-start rounded-full bg-surface-container p-1 md:hidden">
      <Button
        className="px-4! py-1.5!"
        variant={mobileView === "list" ? "dark" : "ghost"}
        onClick={() => onToggle("list")}
      >
        Liste
      </Button>
      <Button
        className="px-4! py-1.5!"
        variant={mobileView === "map" ? "dark" : "ghost"}
        onClick={() => onToggle("map")}
      >
        Carte
      </Button>
    </div>
  );
}
