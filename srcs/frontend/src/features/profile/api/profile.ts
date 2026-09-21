import type {
  SignupData,
  SignupResponse,
  ModifyProfileData,
  ModifyProfileResponse,
  ModifyPasswordData,
  ModifyPasswordResponse,
} from "../types";
import { getCsrfToken } from "../../auth/api/auth";
import { getCookie } from "@/shared/api/cookies";

const API_BASE_URL = "/api";

//SDU : les messages sont en anglais
function getApiErrorMessage(result: unknown): string {
  if (typeof result === "string") {
    return result;
  }

  if (typeof result !== "object" || result === null) {
    return "Une erreur est survenue.";
  }

  const errors = result as Record<string, unknown>;

  if (typeof errors.detail === "string") {
    return errors.detail;
  }

  return Object.entries(errors)
    .map(([field, message]) => {
      if (Array.isArray(message)) {
        return `${field} : ${message
          .map((item) => formatErrorMessage(item))
          .join(", ")}`;
      }

      return `${field} : ${formatErrorMessage(message)}`;
    })
    .join("\n");
}

function formatErrorMessage(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatErrorMessage(item)).join(", ");
  }

  if (typeof value === "object" && value !== null) {
    const object = value as Record<string, unknown>;

    if (typeof object.message === "string") {
      return object.message;
    }

    return Object.entries(object)
      .map(([key, nestedValue]) => {
        return `${key} : ${formatErrorMessage(nestedValue)}`;
      })
      .join(", ");
  }

  return String(value);
}

export async function signup(data: SignupData): Promise<SignupResponse> {
  await getCsrfToken();
  const csrfToken = getCookie("csrftoken");
  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const response = await fetch(`${API_BASE_URL}/travelers/create/`, {
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
    throw new Error(getApiErrorMessage(result));
  }

  return result;
}

export async function modifyProfile(
  data: ModifyProfileData,
): Promise<ModifyProfileResponse> {
  const csrfToken = getCookie("csrftoken");
  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const response = await fetch(`${API_BASE_URL}/travelers/update/`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(getApiErrorMessage(result));
  }

  return result;
}

export async function modifyPassword(
  data: ModifyPasswordData,
): Promise<ModifyPasswordResponse> {
  const csrfToken = getCookie("csrftoken");
  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const response = await fetch(`${API_BASE_URL}/travelers/update-password/`, {
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
    throw new Error(getApiErrorMessage(result));
  }

  return result;
}
