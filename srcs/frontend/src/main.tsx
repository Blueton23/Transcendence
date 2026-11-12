import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./app/App.tsx";
import { AuthProvider } from "./features/auth/context/AuthProvider";
import "./i18n";
import { ErrorProvider } from "./shared/context/ErrorProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorProvider>
    </BrowserRouter>
  </StrictMode>,
);
