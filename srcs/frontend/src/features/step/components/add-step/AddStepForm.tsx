import { PlaceSearchField } from "./PlaceSearchField";
import { PlaceSuggestions } from "./PlaceSuggestions";
import { DatesPanel } from "@/features/step/components/add-step/DatesPanel";
import { formatDateRange } from "@/features/step/utils/stepDates";
import type { Travel } from "@/features/travel/types";
import type { Step } from "@/features/step/types";
import { useStepForm } from "@/features/step/hooks/useStepForm";
import type { Place } from "@/features/map/types";
import { useListKeyboard } from "@/shared/hooks/useListKeyboard";
import type { RefObject } from "react";

interface AddStepFromProps {
  steps: Step[];
  travel: Travel;
  refetch: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export function AddStepForm({
  steps,
  travel,
  refetch,
  inputRef,
}: AddStepFromProps) {
  const form = useStepForm({ travel, onSuccess: refetch });

  const pickPlace = (place: Place) => {
    form.selectPlace(place);
    form.setOpenPanel("calendar");
  };
  const list = useListKeyboard(form.suggestions, pickPlace);

  return (
    <div className="relative">
      <PlaceSearchField
        value={form.query}
        dateLabel={formatDateRange(form.selected)}
        onChange={(e) => {
          form.changeQuery(e.target.value);
          list.reset();
        }}
        onBlur={() =>
          form.setOpenPanel((current) => (current === "place" ? null : current))
        }
        onFocus={() => form.setOpenPanel("place")}
        onCalendarClick={() => {
          form.setOpenPanel((current) =>
            current === "calendar" ? null : "calendar",
          );
        }}
        onKeyDown={list.handleKeyDown}
        inputRef={inputRef}
      />
      {form.openPanel === "place" && form.query !== "" && (
        <PlaceSuggestions
          items={form.suggestions}
          isLoading={form.isLoading}
          failed={form.searchFailed}
          onSelect={pickPlace}
          activeIndex={list.activeIndex}
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
