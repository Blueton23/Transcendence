import i18n from "@/i18n";

import { getApiErrorMessage, type ApiErrorResponse } from "./errors";

export async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    if (contentType?.includes("application/json")) {
      const error = (await response.json()) as ApiErrorResponse;
      throw new Error(getApiErrorMessage(error));
    }
    const detail = await response.text();
    throw new Error(detail || i18n.t("errors.server"));
  }

  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  throw new Error(i18n.t("errors.invalidResponse"));
}
