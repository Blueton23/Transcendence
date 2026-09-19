import { useState } from "react";
import type { Step } from "@/features/step/types";
import Modal from "@/shared/ui/Modal";
import Button from "@/shared/ui/Button";
import Heading from "@/shared/ui/Heading";
import { PlaceSearchField } from "@/features/step/components/add-step/PlaceSearchField";
import { DatesPanel } from "@/features/step/components/add-step/DatesPanel";
import type { Travel } from "@/features/travel/types";
import { PlaceSuggestions } from "@/features/step/components/add-step/PlaceSuggestions";
import type { DateRange } from "@daypicker/react";

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
}

export function ModifyStepModal({
  step,
  steps,
  travel,
  onClose,
}: ModifyStepProps) {
  type OpenPanel = "place" | "calendar" | null;

  const [query, setQuery] = useState(step.localisation);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [selected, setSelected] = useState<DateRange>();
  const [noOvernight, setNoOvernight] = useState(false);
  const filtered = results.filter((lieu) =>
    lieu.toLowerCase().includes(query.toLowerCase()),
  );

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
      <Heading>Lieu et date</Heading>
      <PlaceSearchField
        variant="white"
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
          onClose={() => setOpenPanel(null)}
        />
      )}
      <Button type="submit" variant="primary" className="w-full">
        Enregistrer les modifications
      </Button>
    </Modal>
  );
}
