import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getCurrentUser, isLoggedIn } from "../lib/auth.js";

export default function InstallateurRoute() {
  const location = useLocation();
  if (!isLoggedIn()) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  const me = getCurrentUser();
  if (!me) {
    return <Navigate to="/login" replace />;
  }
  if (me.role === "installateur" || me.role === "admin") {
    return <Outlet />;
  }
  return <Navigate to="/dashboard" replace />;
}
