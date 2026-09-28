import { PlaceSearchField } from "./PlaceSearchField";
import { PlaceSuggestions } from "./PlaceSuggestions";
import { DatesPanel } from "@/features/step/components/add-step/DatesPanel";
import { formatDateRange } from "@/features/step/utils/stepDates";
import type { Travel } from "@/features/travel/types";
import type { Step } from "@/features/step/types";
import { UseStepForm } from "@/features/step/hooks/useStepForm";

interface AddStepFromProps {
  steps: Step[];
  travel: Travel;
  refetch: () => void;
}

export function AddStepForm({ steps, travel, refetch }: AddStepFromProps) {
  const form = UseStepForm({ travel, onSuccess: refetch });

  return (
    <div className="relative">
      <PlaceSearchField
        value={form.query}
        dateLabel={formatDateRange(form.selected)}
        onChange={(e) => form.changeQuery(e.target.value)}
        onBlur={() =>
          form.setOpenPanel((current) => (current === "place" ? null : current))
        }
        onFocus={() => form.setOpenPanel("place")}
        onCalendarClick={() => {
          form.setOpenPanel((current) =>
            current === "calendar" ? null : "calendar",
          );
        }}
      />
      {form.openPanel === "place" && form.query !== "" && (
        <PlaceSuggestions
          items={form.suggestions}
          isLoading={form.isLoading}
          onSelect={form.selectPlace}
        />
      )}
      {form.openPanel === "calendar" && (
        <DatesPanel
          steps={steps}
          travel={travel}
          selected={form.selected}
          onSelect={form.setSelected}
          noOvernight={form.noOvernight}
          onNoOvernightChange={form.changeNoOvernight}
          onSubmit={form.handleSubmit}
          onClose={() => form.setOpenPanel(null)}
          isSubmitting={form.isSubmitting}
          error={form.error}
        />
      )}
      {form.openPanel === "calendar" && (
        <div className="fixed inset-0 z-10 bg-scrim md:hidden" />
      )}
    </div>
  );
}
