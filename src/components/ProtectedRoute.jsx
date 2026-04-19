import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getCurrentUser, isLoggedIn } from "../lib/auth.js";

export default function ProtectedRoute({ roles }) {
  const location = useLocation();
  if (!isLoggedIn()) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (roles && roles.length > 0) {
    const me = getCurrentUser();
    if (!me || !roles.includes(me.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  return <Outlet />;
}
