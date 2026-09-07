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
    <div className="flex min-h-0 flex-1 flex-col gap-2 md:grid md:grid-cols-2">
      <div
        className={`flex min-h-0 flex-1 flex-col gap-6 ${mobileView === "map" ? "hidden" : "flex"}`}
      >
        {children}
      </div>
      <div className={`md:block ${mobileView === "map" ? "block" : "hidden"}`}>
        <MapPlaceholder />
      </div>
    </div>
  );
}
