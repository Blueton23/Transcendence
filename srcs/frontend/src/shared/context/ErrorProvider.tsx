import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ErrorContext } from "@/shared/context/ErrorContext";

const DISPLAY_MS = 5000;

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [message]);

  const showError = useCallback((newMessage: string) => {
    if (!navigator.onLine) return;
    setMessage(newMessage);
  }, []);

  return (
    <ErrorContext.Provider value={{ message, showError }}>
      {children}
    </ErrorContext.Provider>
  );
}
