import type { AuthResponse, LoginData } from "../types";
import { getCookie } from "@/shared/api/cookies";
import i18n from "@/i18n";
import { parseResponse } from "@/shared/api/parseResponse";

const API_BASE_URL = "/api";

export async function getCsrfToken(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
    method: "GET",
    credentials: "include",
    headers: { "Accept-Language": i18n.language },
  });

  await parseResponse<void>(response);
}

export async function login(data: LoginData): Promise<AuthResponse> {
  await getCsrfToken();

  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
      "Accept-Language": i18n.language,
    },
    body: JSON.stringify(data),
  });

  return parseResponse<AuthResponse>(response);
}

export async function getMe(): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me/`, {
    method: "GET",
    credentials: "include",
    headers: { "Accept-Language": i18n.language },
  });

  return parseResponse<AuthResponse>(response);
}

export async function logout(): Promise<void> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": csrfToken,
      "Accept-Language": i18n.language,
    },
  });

  await parseResponse<void>(response);
}
