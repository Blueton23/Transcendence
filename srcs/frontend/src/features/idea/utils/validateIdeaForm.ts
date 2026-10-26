import type { IdeaFormValues } from "@/features/idea/types";
import { formatDateToISO } from "@/features/idea/utils/formatDate";
import i18n from "@/i18n";

interface IdeaFormErrors {
  titleError: string | undefined;
  datesError: string | undefined;
}

export function validateIdeaForm(values: IdeaFormValues): IdeaFormErrors {
  const titleError =
    values.title.trim() === ""
      ? i18n.t("idea.errors.titleRequired")
      : undefined;

  const isAccommodation = values.type === "accommodation";
  const startDate = values.dateRange?.from;
  const endDate = values.dateRange?.to;

  let datesError: string | undefined;

  if (isAccommodation) {
    if (!startDate || !endDate) {
      datesError = i18n.t("idea.errors.lodgingDatesRequired");
    } else if (formatDateToISO(endDate) <= formatDateToISO(startDate)) {
      datesError = i18n.t("idea.errors.departureBeforeArrival");
    }
  } else if (values.stepId !== null && !startDate) {
    datesError = i18n.t("idea.errors.dateRequired");
  }

  return { titleError, datesError };
}

/*
Fonction utiles pour valider les entrées du formulaire "Epingler une idée/Modifier une idée"
*/
