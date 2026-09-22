import { TravelHeader } from "@/features/travel/components/travelHeader";
import type { Travel } from "@/features/travel/types";
import { computeTotalKms } from "@/features/step/utils/segmentDuration";
import type { Segment } from "@/features/step/api/segmentApi";
import { ToggleMobileButton } from "@/features/step/components/mobile/ToggleMobileButton";

export interface ItineraryHeaderProps {
  travel: Travel;
  segments: Segment[];
  mobileView: "list" | "map";
  onToggle: (view: "list" | "map") => void;
  isDetailView: boolean;
}

export function ItineraryHeader({
  travel,
  segments,
  mobileView,
  onToggle,
  isDetailView,
}: ItineraryHeaderProps) {
  const totalKms = computeTotalKms(segments);
  return (
    <div className="flex flex-col gap-4">
      <TravelHeader travel={travel} totalKms={totalKms} />
      {!isDetailView && (
        <ToggleMobileButton mobileView={mobileView} onToggle={onToggle} />
      )}
    </div>
  );
}
