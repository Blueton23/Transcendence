import { useState } from "react";
import { type DateRange } from "@daypicker/react";
import { useSubmitAction } from "@/shared/hooks/useSubmitAction";
import { createStep, updateStep } from "@/features/step/api/stepApi";
import { toApiDateString } from "@/features/step/utils/stepDates";
import type { Travel } from "@/features/travel/types";
import type { Step } from "@/features/step/types";
import type { Place } from "@/features/map/types";
import { searchPlace } from "@/features/map/api/mapboxApi";
import { usePlaceSuggestions } from "@/features/map/hooks/usePlaceSuggestions";

type OpenPanel = "place" | "calendar" | null;

interface UseStepFormProps {
  step?: Step;
  travel: Travel;
  onSuccess: () => void;
}

function placeFromStep(step?: Step): Place | null {
  if (!step || step.latitude == null || step.longitude == null) return null;
  return {
    localisation: step.localisation,
    latitude: Number(step.latitude),
    longitude: Number(step.longitude),
  };
}

export function UseStepForm({ step, travel, onSuccess }: UseStepFormProps) {
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<Place | null>(placeFromStep(step));
  const [selected, setSelected] = useState<DateRange | undefined>(
    step
      ? { from: new Date(step.startDate), to: new Date(step.endDate) }
      : undefined,
  );
  const [noOvernight, setNoOvernight] = useState(
    step ? step.startDate === step.endDate : false,
  );
  const { suggestions, isLoading } = usePlaceSuggestions(query);
  const { submit, isSubmitting, error } = useSubmitAction(async () => {
    if (!selected?.from || !selected?.to) {
      throw new Error("Sélectionne des dates avant de valider.");
    }
    const chosen = place ?? (await searchPlace(query))[0];
    if (!chosen)
      throw new Error("Lieu introuvable, choisis-en un dans la liste.");

    const data = {
      ...chosen,
      startDate: toApiDateString(selected.from),
      endDate: toApiDateString(selected.to),
    };
    return step
      ? updateStep(travel.id, step.id, data)
      : createStep(travel.id, data);
  });

  const changeQuery = (value: string) => {
    setQuery(value);
    setPlace(null);
    setOpenPanel("place");
  };

  const selectPlace = (choice: Place) => {
    setPlace(choice);
    setQuery(choice.localisation);
    setOpenPanel(null);
  };

  const changeNoOvernight = (checked: boolean) => {
    setNoOvernight(checked);
    setSelected(
      checked && selected?.from
        ? { from: selected.from, to: selected.from }
        : undefined,
    );
  };

  const handleSubmit = async () => {
    const result = await submit();
    if (result.success) {
      setOpenPanel(null);
      setQuery("");
      setPlace(null);
      setSelected(undefined);
      setPlace(null);
      setNoOvernight(false);
      onSuccess();
    }
  };

  return {
    openPanel,
    setOpenPanel,
    query,
    changeQuery,
    suggestions,
    isLoading,
    selectPlace,
    selected,
    setSelected,
    noOvernight,
    changeNoOvernight,
    handleSubmit,
    isSubmitting,
    error,
  };
}
