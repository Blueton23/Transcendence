import { useState } from "react";
import type { Step } from "@/features/step/types";
import Modal from "@/shared/ui/Modal";
import Button from "@/shared/ui/Button";
import Text from "@/shared/ui/Text";
import { PlaceSearchField } from "@/features/step/components/add-step/PlaceSearchField";
import { DatesPanel } from "@/features/step/components/add-step/DatesPanel";
import type { Travel } from "@/features/travel/types";
import { PlaceSuggestions } from "@/features/step/components/add-step/PlaceSuggestions";
import type { DateRange } from "@daypicker/react";
import {
  formatDateRange,
  toApiDateString,
} from "@/features/step/utils/stepDates";
import { updateStep } from "@/features/step/api/stepApi";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";

const results = [
  "Zinal, Valais, Suisse",
  "Zermatt, Valais, Suisse",
  "Montreux, Vaud, Suisse",
];

export interface ModifyStepProps {
  step: Step;
  steps: Step[];
  travel: Travel;
  onClose: () => void;
  refetch: () => void;
}

export function ModifyStepModal({
  step,
  steps,
  travel,
  onClose,
  refetch,
}: ModifyStepProps) {
  type OpenPanel = "place" | "calendar" | null;

  const [query, setQuery] = useState(step.localisation);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [selected, setSelected] = useState<DateRange | undefined>({
    from: new Date(step.startDate),
    to: new Date(step.endDate),
  });
  const [noOvernight, setNoOvernight] = useState(
    step.startDate === step.endDate,
  );
  const filtered = results.filter((lieu) =>
    lieu.toLowerCase().includes(query.toLowerCase()),
  );

  const { submit, isSubmitting, error } = useSubmitAction(() => {
    if (!selected?.from || !selected?.to) {
      throw new Error("Sélectionne des dates avant de valider.");
    }
    return updateStep(travel.id, step.id, {
      localisation: query,
      startDate: toApiDateString(selected.from),
      endDate: toApiDateString(selected.to),
    });
  });

  const handleOnSubmit = async () => {
    const result = await submit();
    if (result.success) {
      refetch();
      onClose();
    }
  };

  const handleSelect = (lieu: string) => {
    setQuery(lieu);
    setOpenPanel(null);
  };

  const handleNoOvernightChange = (checked: boolean) => {
    setNoOvernight(checked);
    if (checked && selected?.from) {
      setSelected({ from: selected.from, to: selected.from });
    }
  };

  return (
    <Modal icon="pinplus" title="Modifier l'étape" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Text tone="secondary" className="font-semibold">
            Lieu et dates
          </Text>
          <div className="relative">
            <PlaceSearchField
              variant="white"
              value={query}
              dateLabel={formatDateRange(selected)}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() =>
                setOpenPanel((current) =>
                  current === "place" ? null : current,
                )
              }
              onFocus={() => setOpenPanel("place")}
              onCalendarClick={() => {
                setOpenPanel((current) =>
                  current === "calendar" ? null : "calendar",
                );
              }}
            />
          </div>
        </div>
        {openPanel === "place" && query !== "" && (
          <PlaceSuggestions items={filtered} onSelect={handleSelect} />
        )}
        {openPanel === "calendar" && (
          <DatesPanel
            steps={steps.filter((step) => step.id !== step.id)}
            travel={travel}
            selected={selected}
            className="relative"
            onSelect={setSelected}
            noOvernight={noOvernight}
            onNoOvernightChange={handleNoOvernightChange}
            onClose={() => setOpenPanel(null)}
          />
        )}
        <Button
          onClick={handleOnSubmit}
          disabled={isSubmitting}
          onMouseDown={(e) => e.stopPropagation()}
          type="submit"
          variant="primary"
          className="w-full"
        >
          {isSubmitting
            ? "Modifications en cours"
            : "Enregistrer les modifications"}
        </Button>
        {error && <Text tone="accent">{error}</Text>}
      </div>
    </Modal>
  );
}
