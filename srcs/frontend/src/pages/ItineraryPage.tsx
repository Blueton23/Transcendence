import { getSteps } from "../features/step/api/stepApi";
import StepCard from "../features/step/components/StepCard";

//TODO(branchement): dateLabel en dur, remplacer par travel.startDAte une fois Travel branche
// + quand getStep sera async faudra utiliser ex:useSteps() pour letat de chargement
function ItineraryPage() {
	const steps = getSteps();
  
	return (
	  <div className="flex flex-col gap-4">
		{steps.map((step) => (
		  <StepCard
			key={step.id}
			step={step}
			dateLabel="12.07"
			ideaCount={2}
		  />
		))}
	  </div>
	);
  }
  export default ItineraryPage;

