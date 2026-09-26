import type {
  SignupData,
  SignupResponse,
  ModifyProfileData,
  ModifyProfileResponse,
  ModifyPasswordData,
  ModifyPasswordResponse,
  ModifyProfilePictureResponse,
} from "../types";

import { getCsrfToken } from "../../auth/api/auth";
import { getCookie } from "@/shared/api/cookies";
import { getApiErrorMessage } from "@/shared/api/errors";

const API_BASE_URL = "/api";

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

export async function modifyProfilePicture(
  file: File,
): Promise<ModifyProfilePictureResponse> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error("Token CSRF introuvable.");
  }

  const formData = new FormData();

  formData.append("profile_picture", file);

  const response = await fetch(
    `${API_BASE_URL}/travelers/update-profile-picture/`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
      },
      body: formData,
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(getApiErrorMessage(result));
  }

  return result;
}
