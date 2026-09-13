import type { CreateIdeaInput, IdeaFormValues } from "@/features/idea/types";
import { formatDateToISO } from "@/features/idea/utils/formatDate";

interface LocationValues {
  localisation: string | null;
  latitude: number | null;
  longitude: number | null;
}

export function ideaFormInput(
  values: IdeaFormValues,
  location: LocationValues = {
    localisation: null,
    latitude: null,
    longitude: null,
  },
): CreateIdeaInput {
  const isAccommodation = values.type === "accommodation";

  return {
    title: values.title,
    type: values.type,
    stepId: values.stepId,

    url: values.url === "" ? null : values.url,
    note: values.note === "" ? null : values.note,

    localisation: location.localisation,
    latitude: location.latitude,
    longitude: location.longitude,

    pricePerNight:
      isAccommodation && values.pricePerNight !== ""
        ? Number(values.pricePerNight)
        : null,

    arrivalDate:
      isAccommodation && values.dateRange?.from
        ? formatDateToISO(values.dateRange.from)
        : null,

    departureDate:
      isAccommodation && values.dateRange?.to
        ? formatDateToISO(values.dateRange.to)
        : null,
  };
}

/*
Fonction pour modifier l'état du formulaire dans ideaForm.tsx
Utilisable dans create_idea et edit_idea
*/
