import i18n from "@/i18n";
import { getApiErrorMessage, type ApiErrorResponse } from "./errors";

function parseApiError(rawBody: string): ApiErrorResponse {
  return JSON.parse(rawBody) as ApiErrorResponse;
}

async function handleErrorResponse(
  response: Response,
  contentType: string | null,
): Promise<never> {
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
      result = parseApiError(rawBody);
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

export async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  if (!response.ok) {
    return handleErrorResponse(response, contentType);
  }
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  throw new Error(i18n.t("errors.invalidResponse"));
}
