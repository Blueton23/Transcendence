import { TravelHeader } from "@/features/travel/components/TravelHeader";
import type { Travel } from "@/features/travel/types";
import { computeTotalKms } from "@/features/step/utils/segmentDuration";
import type { Segment } from "@/features/step/api/segmentApi";
import { ToggleMobileButton } from "@/features/step/components/mobile/ToggleMobileButton";
import { useState } from "react";
import IconButton from "@/shared/ui/IconButton";
import Heading from "@/shared/ui/Heading";
import Icon from "@/shared/ui/Icon";
import { StepFormModal } from "@/features/step/components/modal/StepFormModal";
import type { Step } from "@/features/step/types";

export interface ItineraryHeaderProps {
  travel: Travel;
  steps: Step[];
  segments: Segment[];
  mobileView: "list" | "map";
  onToggle: (view: "list" | "map") => void;
  refetch: () => void;
  isDetailView: boolean;
}

export function ItineraryHeader({
  travel,
  steps,
  segments,
  mobileView,
  onToggle,
  refetch,
  isDetailView,
}: ItineraryHeaderProps) {
  const totalKms = computeTotalKms(segments);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4 pb-4 md:pb-0">
      <TravelHeader travel={travel} totalKms={totalKms} />
      {!isDetailView && (
        <div className="flex justify-between gap-5 md:hidden">
          <div
            className="flex cursor-pointer items-center gap-3 md:hidden"
            onClick={() => setIsAddStepOpen(true)}
          >
            <IconButton
              variant="primary"
              icon={<Icon name="pinplus" size={20} />}
              label="Ajouter une étape"
            />
            <Heading size="sm" level={3}>
              Ajouter une étape
            </Heading>
          </div>
          <ToggleMobileButton mobileView={mobileView} onToggle={onToggle} />
        </div>
      )}
      {isAddStepOpen && (
        <StepFormModal
          steps={steps}
          travel={travel}
          refetch={refetch}
          onClose={() => setIsAddStepOpen(false)}
        />
      )}
    </div>
  );
}
