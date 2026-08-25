import { useState } from "react";
import type { Idea } from "../types";
import { getIdeas } from "../api/api.ideas";

//gère plusieurs idées
export function useIdeas() {
  const [ideas] = useState<Idea[]>(() => getIdeas());

  //tableau d'idées
  return ideas;
}
