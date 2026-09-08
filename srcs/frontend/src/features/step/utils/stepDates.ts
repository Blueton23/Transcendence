import type { Step } from "../types";

export function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("fr-CH", { weekday: "short", day: "numeric" })
    .format(date)
    .replace(".", "");
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-CH", { day: "numeric", month: "2-digit" })
    .format(date)
    .replace("/", ".");
}

// labels autre synthaxe cest string[] = [] veut dire doit etre un tableau de string et on commence a vide
export function computeDateLabels(steps: Step[]): string[] {
  return steps.map((step) => {
    const startDate = new Date(step.startDate);
    const endDate = new Date(step.endDate);
    if (step.startDate === step.endDate) {
      return formatDate(startDate);
    }
    return `${formatDate(startDate)}-${formatDate(endDate)}`;
  });
}
