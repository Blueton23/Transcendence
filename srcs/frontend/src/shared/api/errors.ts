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
