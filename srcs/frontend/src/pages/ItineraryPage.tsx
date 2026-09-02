import { getSteps } from "@/features/step/api/stepApi";
import { getSegments } from "@/features/step/api/segmentApi";
import { getTravel } from "@/features/travel/api/travelApi";
import { computeDateLabels } from "@/features/step/stepDates";
import Heading from "@/shared/ui/Heading";
import { useState } from "react";
import { ItineraryLayout } from "@/features/step/components/page/ItineraryLayout";
import { ItineraryList } from "@/features/step/components/page/ItineraryList";
import { TravelHeader } from "@/features/travel/components/travelHeader";
import { computeTotalKms } from "@/features/step/segmentDuration";

//TODO(branchement):
// + quand getStep sera async faudra utiliser ex:useSteps() pour letat de chargement
// + ideaCount en dur : confirmer avec David si on utilisera annotate pour l idea courant
// cote serializer comme ca step.ideaCount au lieu de la valeur en dur {2}
// Button epingler une idee a importer une fois que la features chez David existe

function ItineraryPage() {
  const steps = getSteps();
  const travel = getTravel();
  const segments = getSegments();
  const totalKms = computeTotalKms(segments);
  const dateLabels = computeDateLabels(steps, travel.startDate);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  return (
    <div className="flex flex-col gap-4 p-4">
      <TravelHeader
        travel={travel}
        totalKms={totalKms}
        firstStep={steps[0]}
        lastStep={steps[steps.length - 1]}
      />
      <Heading level={1} size="md">
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
