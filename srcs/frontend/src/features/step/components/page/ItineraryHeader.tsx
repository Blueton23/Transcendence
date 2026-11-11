import { TravelHeader } from "@/features/travel/components/TravelHeader";
import type { Travel } from "@/features/travel/types";
import type { Step } from "@/features/step/types";
import type { Route } from "@/features/map/types";
import { ItineraryMobileHeader } from "@/features/step/components/mobile/ItineraryMobileHeader";

export interface ItineraryHeaderProps {
  travel: Travel;
  steps: Step[];
  route: Route | null;
  mobileView: "list" | "map";
  onToggle: (view: "list" | "map") => void;
  isDetailView: boolean;
}

export function ItineraryHeader({
  travel,
  steps,
  route,
  mobileView,
  onToggle,
  isDetailView,
}: ItineraryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-4 md:pb-0">
      <div className="hidden md:block">
        <TravelHeader travel={travel} totalKms={route?.totalDistanceKm ?? 0} />
      </div>
      {!isDetailView && (
        <ItineraryMobileHeader
          steps={steps}
          route={route}
          mobileView={mobileView}
          onToggle={onToggle}
        />
      )}
    </div>
  );
}
