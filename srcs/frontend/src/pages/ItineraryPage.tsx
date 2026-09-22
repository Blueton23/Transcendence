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
import { Navigate } from "react-router";
import { StepFormModal } from "@/features/step/components/modal/StepFormModal";
import { StickyHeader } from "@/shared/ui/StickyHeader";

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
    refetch,
  } = useSteps(travelId);
  const segments = getSegments();
  const dateLabels = computeDateLabels(steps);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [detailStepId, setDetailStepId] = useState<number | null>(null);
  const detailView = steps.find((step) => step.id === detailStepId) ?? null;

  const [stepToModify, setStepToModify] = useState<Step | null>(null);

  const isLoading = isLoadingTravel || isLoadingSteps;
  const error = errorTravel || errorSteps;
  if (isLoading) return null;
  if (error) return <Navigate to="/trip" replace />;
  if (!travel) return null;
  const selectedStepIndex = detailView
    ? steps.findIndex((step) => step.id === detailView.id)
    : -1;

  return (
    <div className="flex flex-col gap-4 px-4 pb-0 md:h-full md:pb-4">
      <StickyHeader>
        <ItineraryHeader
          travel={travel}
          steps={steps}
          segments={segments}
          mobileView={mobileView}
          onToggle={setMobileView}
          refetch={refetch}
          isDetailView={detailView !== null}
        />
      </StickyHeader>
      <ItineraryLayout mobileView={mobileView}>
        {detailView ? (
          <StepDetail
            step={detailView}
            dateLabel={dateLabels[selectedStepIndex]}
            onBack={() => setDetailStepId(null)}
            onModify={() => setStepToModify(detailView)}
            travel={travel}
          />
        ) : (
          <div className="flex flex-col gap-4 md:min-h-0 md:flex-1">
            <ItineraryListPanel
              steps={steps}
              segments={segments}
              travel={travel}
              dateLabels={dateLabels}
              onDetailView={(step) => setDetailStepId(step.id)}
              refetch={refetch}
              onModifyStep={setStepToModify}
            />
          </div>
        )}
        <TripActionsButton />
      </ItineraryLayout>
      {stepToModify && (
        <StepFormModal
          step={stepToModify}
          steps={steps}
          travel={travel}
          refetch={refetch}
          onClose={() => setStepToModify(null)}
        />
      )}
    </div>
  );
}
export default ItineraryPage;
