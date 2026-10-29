import i18n from "@/i18n";

export interface ApiErrorResponse {
  status?: number;
  code?: string;
  message?: string;
  detail?: string;
  details?: Record<string, string[]> | null;
}

function getPasswordValidationMessage(result: ApiErrorResponse): string {
  const fallback = i18n.t("auth.errors.passwordValidationFailed");
  const codes = result.details?.codes ?? [];

  if (codes.length === 0) {
    return fallback;
  }
  return codes
    .map((code) => {
      const key = `auth.errors.${code}`;
      return i18n.exists(key) ? i18n.t(key) : fallback;
    })
    .join("\n");
}

function getDetailsMessage(
  details: Record<string, string[]> | null | undefined,
): string | null {
  if (!details) {
    return null;
  }
  return Object.entries(details)
    .map(([field, messages]) => `${field} : ${messages.join(", ")}`)
    .join("\n");
}

function getTranslatedErrorMessage(errorCode: string): string {
  const key = `friendship.errors.${errorCode}`;
  return i18n.exists(key) ? i18n.t(key) : errorCode;
}

export function getApiErrorMessage(result: ApiErrorResponse): string {
  if (result.code === "password_validation_failed") {
    return getPasswordValidationMessage(result);
  }

  const detailsMessage = getDetailsMessage(result.details);
  if (detailsMessage !== null) {
    return detailsMessage;
  }

  const errorCode = result.code ?? result.detail ?? result.message;
  if (errorCode) {
    return getTranslatedErrorMessage(errorCode);
  }

  return i18n.t("errors.unexpected");
}
