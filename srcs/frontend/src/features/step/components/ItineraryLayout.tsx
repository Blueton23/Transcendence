import type { ReactNode } from "react";
import Card from "../../../shared/ui/Card";
import Button from "../../../shared/ui/Button";

function MapPlaceholder() {
  return <Card className="min-h-64 md:h-full">I am a map</Card>;
}

interface ItineraryLayoutProps {
  mobileView: "list" | "map";
  onToggle: (view: "list" | "map") => void;
  children: ReactNode;
}

function ToggleMobileButton({
  mobileView,
  onToggle,
}: Pick<ItineraryLayoutProps, "mobileView" | "onToggle">) {
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

function ItineraryLayout({
  mobileView,
  onToggle,
  children,
}: ItineraryLayoutProps) {
  return (
    <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
      <ToggleMobileButton mobileView={mobileView} onToggle={onToggle} />
      <div
        className={`flex-col gap-6 md:flex ${mobileView === "map" ? "hidden" : "flex"}`}
      >
        {children}
      </div>
      <div className={`md:block ${mobileView === "map" ? "block" : "hidden"}`}>
        <MapPlaceholder />
      </div>
    </div>
  );
}
export default ItineraryLayout;
