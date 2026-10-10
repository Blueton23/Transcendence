import type { IdeaFormValues } from "@/features/idea/types";
import { formatDateToISO } from "@/features/idea/utils/formatDate";

interface IdeaFormErrors {
  titleError: string | undefined;
  datesError: string | undefined;
}

export function validateIdeaForm(values: IdeaFormValues): IdeaFormErrors {
  const titleError =
    values.title.trim() === "" ? "Le titre est obligatoire." : undefined;

  const isAccommodation = values.type === "accommodation";
  const startDate = values.dateRange?.from;
  const endDate = values.dateRange?.to;

  let datesError: string | undefined;

  if (isAccommodation) {
    if (!startDate || !endDate) {
      datesError = "Les dates d’arrivée et de départ sont obligatoires.";
    } else if (formatDateToISO(endDate) < formatDateToISO(startDate)) {
      datesError = "La date de départ ne peut pas précéder la date d’arrivée.";
    }
  } else if (values.stepId !== null && !startDate) {
    datesError = "Choisis une date pour cette idée.";
  }

  return { titleError, datesError };
}

/*
Fonction utiles pour valider les entrées du formulaire "Epingler une idée/Modifier une idée"
*/