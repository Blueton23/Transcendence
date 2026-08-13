import type { Step } from "./types";


function formatDate(date: Date): string {
	return new Intl.DateTimeFormat("fr-CH", { day: "numeric", month: "2-digit" }).format(date).replace("/",".");
}

// labels autre synthaxe cest string[] = [] veut dire doit etre un tableau de string et on commence a vide
export function computeDateLabels(steps: Step[], startDate : string) : string[] {
	const labels: Array<string> = [];
	let currentDate = new Date(startDate);

	for (const step of steps) {
		const arrivalDate = new Date(currentDate);
		const departureDate = new Date(currentDate);
		departureDate.setDate(arrivalDate.getDate() + step.nights)

		const label = step.nights === 0
			? formatDate(arrivalDate)
			: `${formatDate(arrivalDate)}-${formatDate(departureDate)}`;

		labels.push(label);
		currentDate = departureDate;

	}
	return labels;
}