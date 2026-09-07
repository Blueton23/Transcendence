import { getSteps } from "@/features/step/api/stepApi";
import { getSegments } from "@/features/step/api/segmentApi";
import { getTravel } from "@/features/travel/api/travelApi";
import { computeDateLabels } from "@/features/step/stepDates";
import { useState } from "react";
import { ItineraryLayout } from "@/features/step/components/page/ItineraryLayout";
import { ItineraryList } from "@/features/step/components/page/ItineraryList";
import { ItineraryHeader } from "@/features/step/components/page/ItineraryHeader";
import { StepDetail } from "@/features/step/components/detail/StepDetail";
import type { Step } from "@/features/step/types";

//TODO(branchement):
// + quand getStep sera async faudra utiliser ex:useSteps() pour letat de chargement
// + ideaCount en dur : confirmer avec David si on utilisera annotate pour l idea courant
// cote serializer comme ca step.ideaCount au lieu de la valeur en dur {2}
// Button epingler une idee a importer une fois que la features chez David existe

function ItineraryPage() {
  const steps = getSteps();
  const travel = getTravel();
  const segments = getSegments();
  const dateLabels = computeDateLabels(steps, travel.startDate);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [detailView, setDetailView] = useState<Step | null>(null);

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
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <ItineraryList
              steps={steps}
              segments={segments}
              dateLabels={dateLabels}
              onDetailView={setDetailView}
            />
          </div>
        )}
      </ItineraryLayout>
    </div>
  );
}
export default ItineraryPage;
