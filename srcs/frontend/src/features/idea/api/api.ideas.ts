import type {
  Idea,
  CreateIdeaInput,
  PlaceIdeaInput,
  EditIdeaInput,
  IdeaApiResponse,
} from "@/features/idea/types";

import { getCookie } from "@/shared/api/cookies";

import {
  mapIdeaFromApi,
  mapCreateIdeaToApi,
} from "@/features/idea/api/ideaMapper";
import { parseResponse } from "@/shared/api/errors";

// Récupérer les idées du voyage
export async function fetchIdeas(travelId: number): Promise<Idea[]> {
  const response = await fetch(`/api/travels/${travelId}/ideas/`, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseResponse<IdeaApiResponse[]>(response);
  return data.map(mapIdeaFromApi);
}

// Créer une idée dans le voyage
export async function postIdea(
  travelId: number,
  input: CreateIdeaInput,
): Promise<Idea> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable");
  }

  const payload = mapCreateIdeaToApi(input);

  const response = await fetch(`/api/travels/${travelId}/ideas/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse<IdeaApiResponse>(response);
  return mapIdeaFromApi(data);
}

// Modifier une idée du voyage
export async function patchIdea(
  travelId: number,
  ideaId: Idea["id"],
  input: EditIdeaInput,
): Promise<Idea> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable");
  }

  const payload = mapCreateIdeaToApi(input);

  const response = await fetch(`/api/travels/${travelId}/ideas/${ideaId}/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse<IdeaApiResponse>(response);
  return mapIdeaFromApi(data);
}

// fonction métier pour le bouton "placer"
export function placeIdea(ideaId: Idea["id"], input: PlaceIdeaInput) {
  console.log(ideaId, input);
}

export function deleteIdea(ideaId: Idea["id"]) {
  console.log(ideaId);
}

// fonction métier pour le bouton de vote
export function voteIdea(ideaId: Idea["id"]) {
  console.log(ideaId);
}
