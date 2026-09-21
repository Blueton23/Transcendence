import { useState } from "react";
import { PlaceSearchField } from "./PlaceSearchField";
import { PlaceSuggestions } from "./PlaceSuggestions";
import { type DateRange } from "@daypicker/react";
import { DatesPanel } from "@/features/step/components/add-step/DatesPanel";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import { createStep } from "@/features/step/api/stepApi";
import { toApiDateString } from "@/features/step/utils/stepDates";
import type { Travel } from "@/features/travel/types";
import type { Step } from "@/features/step/types";

// TODO(branchement): remplacer results en dur par l'autocomplete de l'API géocodage
const results = [
  "Zinal, Valais, Suisse",
  "Zermatt, Valais, Suisse",
  "Montreux, Vaud, Suisse",
];

type OpenPanel = "place" | "calendar" | null;

interface AddStepFromProps {
  steps: Step[];
  travel: Travel;
  refetch: () => void;
}

export function AddStepForm({ steps, travel, refetch }: AddStepFromProps) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DateRange>();
  const [noOvernight, setNoOvernight] = useState(false);
  const { submit, isSubmitting, error } = useSubmitAction(() => {
    if (!selected?.from || !selected?.to) {
      throw new Error("Sélectionne des dates avant de valider.");
    }
    return createStep(travel.id, {
      localisation: query,
      startDate: toApiDateString(selected.from),
      endDate: toApiDateString(selected.to),
    });
  });

  const filtered = results.filter((lieu) =>
    lieu.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (lieu: string) => {
    setQuery(lieu);
    setOpenPanel(null);
  };

  const handleOnSubmit = async () => {
    const result = await submit();
    if (result.success) {
      setOpenPanel(null);
      refetch();
      setQuery("");
      setSelected(undefined);
      setNoOvernight(false);
    }
  };

  const handleNoOvernightChange = (checked: boolean) => {
    setNoOvernight(checked);
    if (checked && selected?.from) {
      setSelected({ from: selected.from, to: selected.from });
    }
  };

  return (
    <div className="relative">
      <PlaceSearchField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() =>
          setOpenPanel((current) => (current === "place" ? null : current))
        }
        onFocus={() => setOpenPanel("place")}
        onCalendarClick={() => {
          setOpenPanel((current) =>
            current === "calendar" ? null : "calendar",
          );
        }}
      />
      {openPanel === "place" && query !== "" && (
        <PlaceSuggestions items={filtered} onSelect={handleSelect} />
      )}
      {openPanel === "calendar" && (
        <DatesPanel
          steps={steps}
          travel={travel}
          selected={selected}
          onSelect={setSelected}
          noOvernight={noOvernight}
          onNoOvernightChange={handleNoOvernightChange}
          onSubmit={handleOnSubmit}
          onClose={() => setOpenPanel(null)}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}
      {openPanel === "calendar" && (
        <div className="fixed inset-0 z-10 bg-scrim md:hidden" />
      )}
    </div>
  );
}
