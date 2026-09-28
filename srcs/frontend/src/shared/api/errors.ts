export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  details: Record<string, string[]> | null;
}

export function getApiErrorMessage(result: ApiErrorResponse): string {
  if (result.details) {
    return Object.entries(result.details)
      .map(([field, messages]) => `${field} : ${messages.join(", ")}`)
      .join("\n");
  }
  return result.message;
}

export async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    if (contentType?.includes("application/json")) {
      const result = await response.json();
      throw new Error(getApiErrorMessage(result));
    }

    throw new Error("Une erreur serveur est survenue.");
  }

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  throw new Error("Réponse serveur invalide.");
}
