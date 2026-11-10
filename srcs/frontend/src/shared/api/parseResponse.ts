import i18n from "@/i18n";
import { getApiErrorMessage, type ApiErrorResponse } from "./errors";

export class ApiHttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly codes: string[] = [],
  ) {
    super(message);
    this.name = "ApiHttpError";
  }
}

export async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    if (contentType?.includes("application/json")) {
      const error = (await response.json()) as ApiErrorResponse;

      const codes = (error.errors ?? [])
        .map((item) => item.code)
        .filter((code): code is string => typeof code === "string");

      throw new ApiHttpError(getApiErrorMessage(error), response.status, codes);
    }

    const detail = await response.text();

    throw new ApiHttpError(detail || i18n.t("errors.server"), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  throw new Error(i18n.t("errors.invalidResponse"));
}
