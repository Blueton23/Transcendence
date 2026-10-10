import type {
  Idea,
  CreateIdeaInput,
  PlaceIdeaInput,
  EditIdeaInput,
  IdeaApiResponse,
  ReactionApiResponse,
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

// Récupérer une idée du voyage
export async function fetchIdea(
  travelId: number,
  ideaId: Idea["id"],
): Promise<Idea> {
  const response = await fetch(`/api/travels/${travelId}/ideas/${ideaId}/`, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseResponse<IdeaApiResponse>(response);
  return mapIdeaFromApi(data);
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

// Supprimer une idée du voyage
export async function removeIdea(
  travelId: number,
  ideaId: Idea["id"],
): Promise<void> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable");
  }

  const response = await fetch(`/api/travels/${travelId}/ideas/${ideaId}/`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });

  if (!response.ok) {
    await parseResponse<unknown>(response);
  }
}

// Placer une idée sur le voyage
export async function patchIdeaPlacement(
  travelId: number,
  idea: Idea,
  input: PlaceIdeaInput,
): Promise<Idea> {
  if (input.stepId === null) {
    throw new Error("Choisis une étape pour cette idée");
  }

  const isAccommodation = idea.type === "accommodation";

  if (!isAccommodation && !input.date) {
    throw new Error("Choisis une date pour cette idée");
  }

  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable");
  }

  const payload = isAccommodation
    ? { stepId: input.stepId }
    : {
        stepId: input.stepId,
        startDate: input.date,
        endDate: input.date,
      };

  const response = await fetch(`/api/travels/${travelId}/ideas/${idea.id}/`, {
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

// Choisir un hébergement déjà placé sur une étape
export async function chooseIdea(
  travelId: number,
  ideaId: Idea["id"],
): Promise<Idea> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable");
  }

  const response = await fetch(
    `/api/travels/${travelId}/ideas/${ideaId}/choice/`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    },
  );

  const data = await parseResponse<IdeaApiResponse>(response);
  return mapIdeaFromApi(data);
}

// Voter pour une idée du voyage
export async function addIdeaReaction(
  travelId: number,
  ideaId: Idea["id"],
): Promise<ReactionApiResponse> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable");
  }

  const response = await fetch(
    `/api/travels/${travelId}/ideas/${ideaId}/reaction/`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    },
  );
  return parseResponse<ReactionApiResponse>(response);
}

// Retirer le vote sur une idée du voyage
export async function removeIdeaReaction(
  travelId: number,
  ideaId: Idea["id"],
): Promise<void> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable");
  }
  const response = await fetch(
    `/api/travels/${travelId}/ideas/${ideaId}/reaction/`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    },
  );
  if (!response.ok) {
    await parseResponse<unknown>(response);
  }
}
