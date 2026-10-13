const translations: Record<string, string> = {
  "The idea dates must be within the step dates.":
    "Les dates de l’idée doivent être comprises dans les dates de l’étape sélectionnée.",

  "Another chosen lodging on this step overlaps these dates.":
    "Un hébergement est déjà choisi sur cette étape pour des dates qui chevauchent celles-ci.",

  "The lodging cannot start before the travel.":
    "L’hébergement ne peut pas commencer avant le début du voyage.",

  "The lodging cannot end after the travel.":
    "L’hébergement ne peut pas se terminer après la fin du voyage.",
};

export function translateIdeaError(error: unknown): never {
  if (error instanceof Error) {
    let message = error.message;

    for (const [english, french] of Object.entries(translations)) {
      message = message.replaceAll(english, french);
    }

    if (message !== error.message) {
      message = message.replace(
        /^(?:step|chosenAt|startDate|endDate|start_date|end_date)\s*:\s*/gm,
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
