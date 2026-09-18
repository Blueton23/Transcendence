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
      setError(err instanceof Error ? err.message : "Erreur");
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  }
  return { submit, isSubmitting, error };
}
