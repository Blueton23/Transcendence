import { useState, useEffect } from 'react';
import type { Idea } from "../types";
import { getIdeas } from "../api/api.ideas";

//gère plusieurs idées
export function useIdeas () {
	const [ideas, setIdeas] = useState<Idea[]>([]);

	useEffect(() => {
		const data = getIdeas();
		setIdeas(data);

	}, []);

	//tableau d'idées
	return ideas;
}
