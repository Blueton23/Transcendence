import type { Step } from "@/features/step/types";
import { ItineraryTimeline } from "@/features/step/components/timeline/ItineraryTimeline";
import { TotalSegment } from "../timeline/TotalSegment";
import { AddStepForm } from "@/features/step/components/add-step";
import type { Travel } from "@/features/travel/types";
import type { Route } from "@/features/map/types";
import type { Idea } from "@/features/idea/types";

interface ItineraryListPanelProps {
  steps: Step[];
  ideas: Idea[];
  route: Route | null;
  isLoadingRoute: boolean;
  travel: Travel;
  dateLabels: string[];
  onDetailView: (step: Step) => void;
  onModifyStep: (step: Step) => void;
  onDeleteStep: (step: Step) => Promise<void>;
  refetch: () => void;
}

export function ItineraryListPanel({
  steps,
  ideas,
  route,
  isLoadingRoute,
  travel,
  dateLabels,
  onDetailView,
  onModifyStep,
  onDeleteStep,
  refetch,
}: ItineraryListPanelProps) {
  const segments = isLoadingRoute ? [] : (route?.legs ?? []);
  return (
    <>
      <div className="hidden md:block">
        <AddStepForm steps={steps} travel={travel} refetch={refetch} />
      </div>
      <div className="flex flex-col gap-6 md:min-h-0 md:flex-1 md:overflow-y-auto">
        <ItineraryTimeline
          steps={steps}
          ideas={ideas}
          segments={segments}
          dateLabels={dateLabels}
          onDetailView={onDetailView}
          onModifyStep={onModifyStep}
          onDeleteStep={onDeleteStep}
        />
        <TotalSegment route={route} />
      </div>
    </>
  );
}
