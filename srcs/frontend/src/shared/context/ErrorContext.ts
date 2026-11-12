import { createContext } from "react";

export interface ErrorContextType {
  message: string | null;
  showError: (message: string) => void;
}

export const ErrorContext = createContext<ErrorContextType | undefined>(
  undefined,
);
