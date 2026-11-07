import i18n from "@/i18n";

export interface ApiError {
  code?: string;
  detail?: string;
  attr?: string | null;
}

export interface ApiErrorResponse {
  type?: string;
  errors?: ApiError[];
}

const ERROR_SCOPES = [
  "auth.errors",
  "friendship.errors",
  "chat.errors",
  "idea.errors",
  "profile.errors",
  "step.errors",
  "travel.errors",
  "errors",
];


function translateCode(code: string, attr?: string | null): string {
  // Priorité aux erreurs spécifiques à un champ
  if (attr) {
    for (const scope of ERROR_SCOPES) {
      const attrKey = `${scope}.${attr}.${code}`;

      if (i18n.exists(attrKey)) {
        return i18n.t(attrKey);
      }
    }
  }

  // Sinon, recherche des erreurs génériques
  for (const scope of ERROR_SCOPES) {
    const key = `${scope}.${code}`;

    if (i18n.exists(key)) {
      return i18n.t(key);
    }
  }

  return code;
}


function getErrorMessage(error: ApiError): string {
  if (error.code) {
    return translateCode(error.code, error.attr);
  }

  if (error.detail) {
    return error.detail;
  }

  return i18n.t("errors.unexpected");
}

export function getApiErrorMessage(response: ApiErrorResponse): string {
  if (!response.errors?.length) {
    return i18n.t("errors.unexpected");
  }

  const messages = response.errors.map(getErrorMessage);

  return [...new Set(messages)].join("\n");
}
