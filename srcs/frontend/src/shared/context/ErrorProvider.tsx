import { useEffect, useState, type ReactNode } from "react";
import { ErrorContext } from "@/shared/context/ErrorContext";

const DISPLAY_MS = 5000;

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <ErrorContext.Provider value={{ message, showError: setMessage }}>
      {children}
    </ErrorContext.Provider>
  );
}
