import { getSegments } from "@/features/step/api/segmentApi";
import { useTravel } from "@/features/travel/hooks/useTravel";
import { computeDateLabels } from "@/features/step/utils/stepDates";
import { useState } from "react";
import { ItineraryLayout } from "@/features/step/components/page/ItineraryLayout";
import { ItineraryListPanel } from "@/features/step/components/page/ItineraryListPanel";
import { ItineraryHeader } from "@/features/step/components/page/ItineraryHeader";
import { StepDetail } from "@/features/step/components/page/StepDetail";
import type { Step } from "@/features/step/types";
import { TripActionsButton } from "@/features/step/components/page/TripActionsButton";
import { useSteps } from "@/features/step/hooks/useSteps";
import { useParams } from "react-router";

//TODO(branchement):
// + ideaCount en dur : confirmer avec David si on utilisera annotate pour l idea courant
// cote serializer comme ca step.ideaCount au lieu de la valeur en dur {2} inscrite dans le backend

function ItineraryPage() {
  const { id } = useParams();
  const travelId = Number(id);
  const {
    travel,
    isLoading: isLoadingTravel,
    error: errorTravel,
  } = useTravel(travelId);
  const {
    steps,
    isLoading: isLoadingSteps,
    error: errorSteps,
  } = useSteps(travelId);
  const segments = getSegments();
  const dateLabels = computeDateLabels(steps);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [detailView, setDetailView] = useState<Step | null>(null);

  const isLoading = isLoadingTravel || isLoadingSteps;
  const error = errorTravel || errorSteps;
  if (isLoading) return null;
  if (error) return <p>{error}</p>;

  const selectedStepIndex = detailView
    ? steps.findIndex((step) => step.id === detailView.id)
    : -1;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4">
      <ItineraryHeader
        travel={travel}
        firstStep={steps[0]}
        lastStep={steps[steps.length - 1]}
        segments={segments}
        mobileView={mobileView}
        onToggle={setMobileView}
        isDetailView={detailView !== null}
      />

      <ItineraryLayout mobileView={mobileView}>
        {detailView ? (
          <StepDetail
            step={detailView}
            dateLabel={dateLabels[selectedStepIndex]}
            onBack={() => setDetailView(null)}
            travel={travel}
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <ItineraryListPanel
              steps={steps}
              segments={segments}
              dateLabels={dateLabels}
              onDetailView={setDetailView}
            />
          </div>
        )}
        <TripActionsButton />
      </ItineraryLayout>
    </div>
  );
}
export default ItineraryPage;
