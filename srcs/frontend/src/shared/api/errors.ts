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

function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, letter: string) =>
    letter.toUpperCase(),
  );
}

function translateCode(code: string): string {
  const variants = [code, toCamelCase(code)];

  for (const scope of ERROR_SCOPES) {
    for (const variant of variants) {
      const key = `${scope}.${variant}`;

      if (i18n.exists(key)) {
        return i18n.t(key);
      }
    }
  }

  return code;
}

function getErrorMessage(error: ApiError): string {
  if (error.code) {
    return translateCode(error.code);
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
