import type {
  AuthResponse,
  LoginData,
  SignupData,
} from "../types";

const API_BASE_URL = "/api";

async function getCsrfToken(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Impossible d'initialiser la protection CSRF.");
  }
}

function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(value.join("="));
    }
  }

  return null;
}

export async function signup(data: SignupData): Promise<AuthResponse> {
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
      result.detail || JSON.stringify(result),
    );
  }

  return result;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  await getCsrfToken();

  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
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
      result.detail || "Identifiants invalides.",
    );
  }

  return result;
}

export async function getMe(): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me/`, {
    method: "GET",
    credentials: "include",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.detail || "Utilisateur non authentifié.",
    );
  }

  return result;
}

export async function logout(): Promise<void> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": csrfToken,
    },
  });

  if (!response.ok) {
    const result = await response.json();

    throw new Error(
      result.detail || "Impossible de se déconnecter.",
    );
  }
}