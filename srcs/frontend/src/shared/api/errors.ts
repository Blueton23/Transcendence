export interface ApiErrorResponse {
  status?: number;
  code?: string;
  message?: string;
  detail?: string;
  details?: Record<string, string[]> | null;
}

export function getApiErrorMessage(result: ApiErrorResponse): string {
  if (result.details) {
    return Object.entries(result.details)
      .map(([field, messages]) => `${field} : ${messages.join(", ")}`)
      .join("\n");
  }

  return result.detail ?? result.message ?? "Une erreur est survenue.";
}

export async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    const rawBody = await response.text();

    console.error("API ERROR", {
      status: response.status,
      statusText: response.statusText,
      contentType,
      body: rawBody,
    });

    if (contentType?.includes("application/json")) {
      let result: ApiErrorResponse;

      try {
        result = JSON.parse(rawBody) as ApiErrorResponse;
      } catch {
        throw new Error(rawBody || "Erreur serveur.");
      }

      throw new Error(getApiErrorMessage(result));
    }

    throw new Error(
      rawBody || `Erreur serveur (${response.status} ${response.statusText})`,
    );
  }

  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  throw new Error("Réponse serveur invalide.");
}
