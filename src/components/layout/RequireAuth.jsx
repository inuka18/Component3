import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useRole } from "../../context/RoleContext";

// Prototype gate only, no real auth. Keeps the app shell from ever
// rendering with no logged-in persona (RoleContext.currentUser === null),
// which every other page assumes is set.
export function RequireAuth() {
  const { isAuthenticated } = useRole();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
