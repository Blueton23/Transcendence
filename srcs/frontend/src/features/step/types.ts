// TODO(branchement): confirmer avec Sebastien si latitude/longitude peuvent vraiment etre vides
// flux texte libre sans geolocatison ? sinon enlever le null
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

// TODO(branchement): placeholder en attendant le vrai type Idea de fetaures/idea
// A supprimer une fois le vrai type disponible
	label: string;
	status: "proposed"| "selected"| "reserved";
}
