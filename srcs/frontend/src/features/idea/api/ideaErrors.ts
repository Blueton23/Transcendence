import i18n from "@/i18n";

const translations: Record<string, string> = {
  "The idea dates must be within the step dates.":
    "idea.errors.datesOutsideStep",
  "Another chosen lodging on this step overlaps these dates.":
    "idea.errors.lodgingOverlap",
  "The lodging cannot start before the travel.":
    "idea.errors.lodgingBeforeTravel",
  "The lodging cannot end after the travel.": "idea.errors.lodgingAfterTravel",
};

export function translateIdeaError(error: unknown): never {
  if (error instanceof Error) {
    let message = error.message;

    for (const [english, key] of Object.entries(translations)) {
      message = message.replaceAll(english, i18n.t(key));
    }

    if (message !== error.message) {
      message = message.replace(
        /^(?:step|stepId|chosenAt|startDate|endDate|start_date|end_date)\s*:\s*/gm,
        "",
      );
      throw new Error(message);
    }
  }

  throw error;
}

/*
Traduit les erreurs du backend
*/
