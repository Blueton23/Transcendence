import { useAuth } from "../context/useAuth";
import { Navigate, Outlet } from "react-router";
import { useTranslation } from "react-i18next";

function GuestRoute() {
  const { currentUser, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return <div className="p-6">{t("actions.loading")}</div>;
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
