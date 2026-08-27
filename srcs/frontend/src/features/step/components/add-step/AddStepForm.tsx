import { useState } from "react";
import { PlaceSearchField } from "./PlaceSearchField";
import { PlaceSuggestions } from "./PlaceSuggestions";

// TODO(branchement): remplacer results en dur par l'autocomplete de l'API géocodage
const results = [
  "Zinal, Valais, Suisse",
  "Zermatt, Valais, Suisse",
  "Montreux, Vaud, Suisse",
];

export function AddStepForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = results.filter((lieu) =>
    lieu.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (lieu: string) => {
    setQuery(lieu);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <PlaceSearchField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && query !== "" && (
        <PlaceSuggestions items={filtered} onSelect={handleSelect} />
      )}
    </div>
  );
}
