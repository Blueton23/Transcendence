import i18n from "@/i18n";

export interface ApiErrorResponse {
  status?: number;
  code?: string;
  message?: string;
  detail?: string;
  details?: Record<string, string[]> | null;
}

export function getApiErrorMessage(result: ApiErrorResponse): string {
  if (result.code === "password_validation_failed") {
    const codes = result.details?.codes ?? [];

    if (codes.length === 0) {
      return i18n.t("auth.errors.passwordValidationFailed");
    }

    return codes
      .map((code) => {
        const key = `auth.errors.${code}`;

        return i18n.exists(key)
          ? i18n.t(key)
          : i18n.t("auth.errors.passwordValidationFailed");
      })
      .join("\n");
  }
  if (result.details) {
    return Object.entries(result.details)
      .map(([field, messages]) => `${field} : ${messages.join(", ")}`)
      .join("\n");
  }

  const errorCode = result.code ?? result.detail ?? result.message;

  if (errorCode) {
    const translationKey = `friendship.errors.${errorCode}`;

    if (i18n.exists(translationKey)) {
      return i18n.t(translationKey);
    }

    // Permet aussi de conserver les messages déjà lisibles.
    return errorCode;
  }

  return i18n.t("errors.unexpected");
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
        throw new Error(rawBody || i18n.t("errors.server"));
      }

      throw new Error(getApiErrorMessage(result));
    }

    throw new Error(
      rawBody ||
        i18n.t("errors.serverWithStatus", {
          status: response.status,
          statusText: response.statusText,
        }),
    );
  }

  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  throw new Error(i18n.t("errors.invalidResponse"));
}
