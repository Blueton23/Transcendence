import type { SignupData, SignupResponse } from "../types";
import { getCsrfToken, getCookie } from "../../auth/api/auth"

const API_BASE_URL = "/api";

//SDU : les messages sont en anglais
function getApiErrorMessage(result: unknown): string {
  if (typeof result === "string") {
    return result;
  }
  if (typeof result === "object" && result !== null) {
    const errors = result as Record<string, unknown>;

    if (typeof errors.detail === "string") {
      return errors.detail;
    }
    return Object.entries(errors)
      .map(([field, message]) => {
        if (Array.isArray(message)) {
          return `${field} : ${message.join(", ")}`;
        }

        return `${field} : ${String(message)}`;
      })
      .join("\n");
  }
  return "Impossible de créer le compte.";
}

export async function signup(data: SignupData): Promise<SignupResponse> {
  await getCsrfToken();

  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const response = await fetch(`${API_BASE_URL}/travelers/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      //      result.detail || "Impossible de créer le compte.",
      //      result.detail || JSON.stringify(result),
      getApiErrorMessage(result),
    );
  }

  return result;
}