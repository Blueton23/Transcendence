import { getSteps } from "../features/step/api/stepApi";
import StepCard from "../features/step/components/StepCard";
import { computeDateLabels } from "../features/step/stepDates";

//TODO(branchement): dateLabel en dur, remplacer par travel.startDAte une fois Travel branche
// + quand getStep sera async faudra utiliser ex:useSteps() pour letat de chargement
function ItineraryPage() {
	const steps = getSteps();
	const dateLabels = computeDateLabels(steps, "2026-07-12");
  
	return (
	  <div className="flex flex-col gap-4">
		{steps.map((step, index) => (
		  <StepCard
			key={step.id}
			step={step}
			dateLabel={dateLabels[index]}
			ideaCount={2}
		  />
		))}
	  </div>
	);
  }
  export default ItineraryPage;

