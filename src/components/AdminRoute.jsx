import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getCurrentUser, isLoggedIn } from "../lib/auth.js";

export default function AdminRoute() {
  const location = useLocation();
  if (!isLoggedIn()) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  const me = getCurrentUser();
  if (!me || me.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
