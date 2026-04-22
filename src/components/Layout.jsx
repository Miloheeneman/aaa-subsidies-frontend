import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import NotificationBell from "./NotificationBell.jsx";
import {
  getCurrentUser,
  isLoggedIn,
  onAuthChange,
  removeToken,
} from "../lib/auth.js";

const publicLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/subsidiecheck", label: "Subsidiecheck" },
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
];

const klantLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projecten", label: "Mijn projecten" },
  { to: "/aanvraag/nieuw", label: "Nieuwe aanvraag" },
];

const installateurLinks = [
  { to: "/installateur/dashboard", label: "Dashboard" },
  { to: "/installateur/leads", label: "Leads" },
  { to: "/installateur/dossiers", label: "Dossiers" },
  { to: "/installateur/abonnement", label: "Abonnement" },
];

export default function Layout() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(isLoggedIn());
  const [role, setRole] = useState(getCurrentUser()?.role ?? null);

  useEffect(() => {
    const off = onAuthChange(() => {
      setAuthed(isLoggedIn());
      setRole(getCurrentUser()?.role ?? null);
    });
    return off;
  }, []);

  let navLinks = publicLinks;
  if (authed) {
    if (role === "admin") {
      navLinks = [
        ...publicLinks,
        { to: "/admin", label: "Admin-portaal" },
      ];
    } else if (role === "installateur") navLinks = installateurLinks;
    else navLinks = klantLinks;
  }
  let homeForRole = "/dashboard";
  if (role === "admin") homeForRole = "/admin";
  else if (role === "installateur") homeForRole = "/installateur/dashboard";

  function logout() {
    removeToken();
    setAuthed(false);
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-white/20 bg-brand-green">
        <div className="container-app flex min-h-16 items-center justify-between gap-4 py-2">
          <Link to="/" className="flex shrink-0 items-center">
            <img
              src="/aaa-subsidies-logo.svg"
              alt="AAA-Subsidies"
              className="h-[52px] w-auto"
            />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  [
                    "text-sm font-medium text-white transition hover:text-white/80",
                    isActive ? "underline decoration-2 underline-offset-4" : "",
                  ].join(" ")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            {authed ? (
              <>
                {role === "klant" && <NotificationBell />}
                {role === "admin" && (
                  <span className="hidden rounded-full border border-white/35 bg-white/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white sm:inline">
                    Admin
                  </span>
                )}
                {role === "installateur" && (
                  <span className="hidden rounded-full border border-white/35 bg-white/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white sm:inline">
                    Installateur
                  </span>
                )}
                <Link
                  to={homeForRole}
                  className="hidden text-sm font-semibold text-white transition hover:text-white/80 sm:inline"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-white px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-brand-green"
                >
                  Uitloggen
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden text-sm font-semibold text-white transition hover:text-white/80 sm:inline"
                >
                  Inloggen
                </Link>
                <Link
                  to="/subsidiecheck"
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-green transition hover:bg-white/90"
                >
                  Subsidiecheck
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-brand-greenLight">
        <div className="container-app flex flex-col items-start justify-between gap-4 py-8 text-sm text-gray-700 md:flex-row md:items-center">
          <div>
            <div className="font-bold text-brand-green">AAA-Subsidies</div>
            <div>Een initiatief van AAA-Lex Offices.</div>
          </div>
          <div className="text-gray-500">
            © {new Date().getFullYear()} AAA-Subsidies | Onderdeel van
            AAA-Lex Offices B.V.
          </div>
        </div>
      </footer>
    </div>
  );
}
