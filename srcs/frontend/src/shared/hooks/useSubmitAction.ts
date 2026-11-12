import { toErrorMessage } from "@/shared/api/errors";
import { useState } from "react";

export function useSubmitAction<T>(action: () => Promise<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(): Promise<{ success: boolean; data?: T }> {
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await action();
      return { success: true, data };
    } catch (err) {
      setError(toErrorMessage(err));
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearError() {
    setError(null);
  }

  return { submit, isSubmitting, error, clearError };
}
