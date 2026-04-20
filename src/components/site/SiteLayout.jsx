import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import SiteFooter from "./SiteFooter.jsx";
import SiteNavbar from "./SiteNavbar.jsx";

/**
 * Layout for the public corporate website (home, diensten, over-ons,
 * referenties, contact). The existing portal Layout is left untouched
 * and still wraps all app routes (dashboard, admin, onboarding, …).
 */
export default function SiteLayout() {
  const location = useLocation();

  // Marketing pages usually expect a scroll-to-top on navigation;
  // the deep-linked portal pages manage their own scroll behaviour.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <SiteNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
