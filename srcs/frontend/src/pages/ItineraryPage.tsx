import { getSteps } from "@/features/step/api/stepApi";
import { getSegments } from "@/features/step/api/segmentApi";
import { computeDateLabels } from "@/features/step/stepDates";
import Heading from "@/shared/ui/Heading";
import { useState } from "react";
import { ItineraryLayout } from "@/features/step/components/page/ItineraryLayout";
import { ItineraryList } from "@/features/step/components/page/ItineraryList";

//TODO(branchement): dateLabel en dur, remplacer par travel.startDAte une fois Travel branche
// + quand getStep sera async faudra utiliser ex:useSteps() pour letat de chargement
// + ideaCount en dur : confirmer avec David si on utilisera annotate pour l idea courant
// cote serializer comme ca step.ideaCount au lieu de la valeur en dur {2}
// Button epingler une idee a importer une fois que la features chez David existe

function ItineraryPage() {
  const steps = getSteps();
  const segments = getSegments();
  const dateLabels = computeDateLabels(steps, "2026-07-12");
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  return (
    <div className="flex flex-col gap-4 p-4">
      <Heading level={1} size="lg">
        Itinéraire
      </Heading>
      <ItineraryLayout mobileView={mobileView} onToggle={setMobileView}>
        <ItineraryList
          steps={steps}
          segments={segments}
          dateLabels={dateLabels}
        />
      </ItineraryLayout>
    </div>
  );
}
export default ItineraryPage;
