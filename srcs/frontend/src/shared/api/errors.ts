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
    const rawBody = await response.text();

    console.error("API ERROR", {
      status: response.status,
      statusText: response.statusText,
      contentType,
      body: rawBody,
    });

    if (contentType?.includes("application/json")) {
      try {
        const result: ApiErrorResponse = JSON.parse(rawBody);
        throw new Error(getApiErrorMessage(result));
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }

        throw new Error(rawBody || "Erreur serveur.");
      }
    }

    throw new Error(
      rawBody || `Erreur serveur (${response.status} ${response.statusText})`,
    );
  }

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  throw new Error("Réponse serveur invalide.");
}
