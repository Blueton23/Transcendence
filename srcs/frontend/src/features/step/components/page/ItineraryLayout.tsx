import type { ReactNode } from "react";
import Card from "@/shared/ui/Card";

function MapPlaceholder() {
  return <Card className="min-h-64 md:h-full">I am a map</Card>;
}

interface ItineraryLayoutProps {
  mobileView: "list" | "map";
  children: ReactNode;
}

export function ItineraryLayout({
  mobileView,
  children,
}: ItineraryLayoutProps) {
  return (
    <div className="flex flex-col md:grid md:min-h-0 md:flex-1 md:grid-cols-2 md:gap-2">
      <div
        className={`flex flex-col md:min-h-0 md:flex-1 md:gap-6 ${mobileView === "map" ? "hidden" : "flex"}`}
      >
        {children}
      </div>
      <div className={`md:block ${mobileView === "map" ? "block" : "hidden"}`}>
        <MapPlaceholder />
      </div>
    </div>
  );
}
