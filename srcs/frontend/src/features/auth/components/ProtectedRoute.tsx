import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/features/auth/context/useAuth";
import { useTranslation } from "react-i18next";

function ProtectedRoute() {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (isLoading) {
    return <div className="p-6">{t("actions.loading")}</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
