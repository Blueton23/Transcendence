import { getSteps } from "../features/step/api/stepApi";
import { getSegments } from "../features/step/api/segmentApi";
import SegmentRow from "../features/step/components/Segment";
import StepCard from "../features/step/components/StepCard";
import StepPositionBadge from "../features/step/components/StepPositionBadge";
import { computeDateLabels } from "../features/step/stepDates";
import { Fragment } from "react/jsx-runtime";
import TotalSegment from "../features/step/components/TotalSegment";
import Button from "../shared/ui/Button";
import AddExpenseButton from "../features/spending/components/AddExpenseButton";

//TODO(branchement): dateLabel en dur, remplacer par travel.startDAte une fois Travel branche
// + quand getStep sera async faudra utiliser ex:useSteps() pour letat de chargement
// + ideaCount en dur : confirmer avec David si on utilisera annotate pour l idea courant
// cote serializer comme ca step.ideaCount au lieu de la valeur en dur {2}
// Button epingler une idee a importer une fois que la features chez David existe
function ItineraryPage() {
  const steps = getSteps();
  const segments = getSegments();
  const dateLabels = computeDateLabels(steps, "2026-07-12");

  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
      {steps.map((step, index) => (
        <Fragment key={step.id}>
          {index > 0 && (
            <Fragment>
              <span aria-hidden="true" />
              <SegmentRow segment={segments[index - 1]} />
            </Fragment>
          )}
          <StepPositionBadge position={step.position} />
          <StepCard step={step} dateLabel={dateLabels[index]} ideaCount={2} />
        </Fragment>
      ))}
      <TotalSegment segments={segments}/>
      <div className="col-span-2 flex gap-4">
        <Button variant="primary" className="flex-1">Epingler une idee</Button>
        <AddExpenseButton className="flex-1"/>
      </div>
    </div>

  );
}
export default ItineraryPage;
