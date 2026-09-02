import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="p-6">
        Chargement...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;