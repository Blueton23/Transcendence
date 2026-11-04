import type {
  Spending,
  SpendingInput,
  SpendingSummary,
} from "@/features/spending/types";
import i18n from "@/i18n";
import { getCookie } from "@/shared/api/cookies";
import { getApiErrorMessage } from "@/shared/api/errors";

const API_BASE_URL = "/api";

export async function getSpendings(travelId: number): Promise<Spending[]> {
  const response = await fetch(
    `${API_BASE_URL}/travels/${travelId}/spendings/`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(result) || i18n.t("spending.errors.loadFailed"),
    );
  }
  return result;
}

export async function createSpending(
  travelId: number,
  data: SpendingInput,
): Promise<Spending> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(
    `${API_BASE_URL}/travels/${travelId}/spendings/`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(data),
    },
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(result) || i18n.t("spending.errors.createFailed"),
    );
  }
  return result;
}

export async function updateSpending(
  travelId: number,
  spendingId: number,
  data: SpendingInput,
): Promise<Spending> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(
    `${API_BASE_URL}/travels/${travelId}/spendings/${spendingId}/`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(data),
    },
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(result) || i18n.t("spending.errors.updateFailed"),
    );
  }
  return result;
}

export async function deleteSpending(
  travelId: number,
  spendingId: number,
): Promise<void> {
  const csrfToken = getCookie("csrftoken");

  if (!csrfToken) {
    throw new Error(i18n.t("errors.csrfMissing"));
  }

  const response = await fetch(
    `${API_BASE_URL}/travels/${travelId}/spendings/${spendingId}/`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
    },
  );

  if (!response.ok) {
    const result = await response.json();
    throw new Error(
      getApiErrorMessage(result) || i18n.t("spending.errors.deleteFailed"),
    );
  }
}

export async function getSpendingSummary(
  travelId: number,
): Promise<SpendingSummary> {
  const response = await fetch(
    `${API_BASE_URL}/travels/${travelId}/spendings/summary/`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(result) || i18n.t("spending.errors.loadFailed"),
    );
  }
  return result;
}
