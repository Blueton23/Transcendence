import { useState } from "react";
import { PlaceSearchField } from "./PlaceSearchField";
import { PlaceSuggestions } from "./PlaceSuggestions";
import { type DateRange } from "@daypicker/react";
import { DatesPanel } from "@/features/step/components/add-step/DatesPanel";

// TODO(branchement): remplacer results en dur par l'autocomplete de l'API géocodage
const results = [
  "Zinal, Valais, Suisse",
  "Zermatt, Valais, Suisse",
  "Montreux, Vaud, Suisse",
];

type OpenPanel = "place" | "calendar" | null;

export function AddStepForm() {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DateRange>();
  const [noOvernight, setNoOvernight] = useState(false);

  const filtered = results.filter((lieu) =>
    lieu.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (lieu: string) => {
    setQuery(lieu);
    setOpenPanel(null);
  };

  const handleOnSubmit = () => {
    // TODO(branchement): appeler l'API pour créer l'étape (lieu + dates + noOvernight)
    console.log({ query, selected, noOvernight });
    setOpenPanel(null);
  };

  const handleNoOvernightChange = (checked: boolean) => {
    setNoOvernight(checked);
    if (checked) {
      setSelected(undefined);
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
          selected={selected}
          onSelect={setSelected}
          noOvernight={noOvernight}
          onNoOvernightChange={handleNoOvernightChange}
          onSubmit={handleOnSubmit}
          onClose={() => setOpenPanel(null)}
        />
      )}
    </div>
  );
}
