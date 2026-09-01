import type {
  AuthResponse,
  LoginCredentials,
  LogoutResponse,
} from "../types";

const API_BASE_URL = "/api";

function getCsrfToken(): string {
  const csrfToken = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrftoken="))
    ?.split("=")[1];

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  return csrfToken;
}

export async function initializeCsrf(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Impossible d'initialiser le token CSRF.");
  }
}

export async function login( credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Identifiants incorrects.");
  }

  return response.json();
}

export async function getMe(): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me/`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Utilisateur non authentifié.");
  }

  return response.json();
}

export async function logout(): Promise<LogoutResponse> {
  const csrfToken = getCsrfToken();

  const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });

  if (!response.ok) {
    throw new Error("Impossible de se déconnecter.");
  }

  return response.json();
}