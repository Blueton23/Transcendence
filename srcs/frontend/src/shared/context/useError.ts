import { useContext } from "react";
import { ErrorContext } from "@/shared/context/ErrorContext";

export function useError() {
  const context = useContext(ErrorContext);

  if (!context)
    throw new Error("useError doit être utilisé dans un ErrorProvider");

  return context;
}
