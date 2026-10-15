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
import { useRoute } from "@/features/map/hooks/useRoute";
import { CreateIdeaModal } from "@/features/idea/components/modal/CreateIdeaModal";
import { useIdeas } from "@/features/idea/hooks/useIdeas";

// TODO(branchement): un fois que PR de david est branchee:
// - recharger les etapes (refetch) apres la creation pour mettre a jour ideaCount

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
  const { handleCreateIdea } = useIdeas(travelId);
  const { route, isLoading: isLoadingRoute } = useRoute(steps);
  const dateLabels = computeDateLabels(steps);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [detailStepId, setDetailStepId] = useState<number | null>(null);
  const detailView = steps.find((step) => step.id === detailStepId) ?? null;

  const [stepToModify, setStepToModify] = useState<Step | null>(null);
  const [createIdeaModalOpen, setCreateIdeaModalOpen] = useState(false);

  const isLoading = isLoadingTravel || isLoadingSteps;
  const error = errorTravel || errorSteps;
  if (isLoading) return null;
  if (error) return <Navigate to="/trip" replace />;
  if (!travel) return null;
  const selectedStepIndex = detailView
    ? steps.findIndex((step) => step.id === detailView.id)
    : -1;

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pb-0 md:h-full md:flex-none md:pb-4">
      <StickyHeader>
        <ItineraryHeader
          travel={travel}
          steps={steps}
          route={route}
          mobileView={mobileView}
          onToggle={setMobileView}
          refetch={refetch}
          isDetailView={detailView !== null}
        />
      </StickyHeader>
      <ItineraryLayout
        mobileView={mobileView}
        steps={steps}
        route={route}
        detailStep={detailView}
      >
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
              route={route}
              isLoadingRoute={isLoadingRoute}
              travel={travel}
              dateLabels={dateLabels}
              onDetailView={(step) => setDetailStepId(step.id)}
              refetch={refetch}
              onModifyStep={setStepToModify}
            />
          </div>
        )}
        <TripActionsButton onPinIdea={() => setCreateIdeaModalOpen(true)} />
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
      {createIdeaModalOpen && (
        <CreateIdeaModal
          travelTitle={travel.title}
          steps={steps}
          initialStepId={detailView?.id}
          onClose={() => setCreateIdeaModalOpen(false)}
          onCreate={async (input) => {
            await handleCreateIdea(input);
            refetch();
          }}
        />
      )}
    </div>
  );
}
export default ItineraryPage;
