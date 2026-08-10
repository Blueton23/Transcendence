// question: dans le MDD latitude et longitude on a mis optionnel, mais mnt je suis pas sure que ce soit coherent
export interface Step {
	id: number;
	travelId: number;
	position: number;
	nights: number;
	localisation: string;
	latitude: number;
	longitude: number;
	deletedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

// cette interface disparait une fois qu'on connecte avec le backend et le fichier types.ts de Idea
export interface StepIdeaPreview {
	label: string;
	status: "proposed"| "selected"| "reserved";
}
