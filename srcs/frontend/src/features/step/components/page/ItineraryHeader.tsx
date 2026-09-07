import { TravelHeader } from "@/features/travel/components/travelHeader";
import type { Travel } from "@/features/travel/types";
import type { Step } from "@/features/step/types";
import { computeTotalKms } from "@/features/step/segmentDuration";
import type { Segment } from "@/features/step/api/segmentApi";
import { ToggleMobileButton } from "@/features/step/components/mobile/ToggleMobileButton";

export interface ItineraryHeaderProps {
  travel: Travel;
  segments: Segment[];
  firstStep: Step;
  lastStep: Step;
  mobileView: "list" | "map";
  onToggle: (view: "list" | "map") => void;
  isDetailView: boolean;
}

export function ItineraryHeader({
  travel,
  segments,
  firstStep,
  lastStep,
  mobileView,
  onToggle,
  isDetailView,
}: ItineraryHeaderProps) {
  const totalKms = computeTotalKms(segments);
  return (
    <div className="flex flex-col gap-4">
      <TravelHeader
        travel={travel}
        totalKms={totalKms}
        firstStep={firstStep}
        lastStep={lastStep}
      />
      {!isDetailView && (
        <ToggleMobileButton mobileView={mobileView} onToggle={onToggle} />
      )}
    </div>
  );
}
