import type { ReactNode } from "react";
import { ItineraryMap } from "@/features/map/components/ItineraryMap";
import type { Step } from "@/features/step/types";

interface ItineraryLayoutProps {
  mobileView: "list" | "map";
  children: ReactNode;
  steps: Step[];
}

export function ItineraryLayout({
  mobileView,
  children,
  steps,
}: ItineraryLayoutProps) {
  return (
    <div className="flex flex-1 flex-col md:grid md:min-h-0 md:flex-1 md:grid-cols-2 md:gap-2">
      <div
        className={`flex flex-col md:min-h-0 md:flex-1 md:gap-6 ${mobileView === "map" ? "hidden md:flex" : "flex"}`}
      >
        {children}
      </div>
      <div
        className={`md:block ${mobileView === "map" ? "flex flex-1 flex-col" : "hidden"}`}
      >
        <ItineraryMap steps={steps} />
      </div>
    </div>
  );
}
