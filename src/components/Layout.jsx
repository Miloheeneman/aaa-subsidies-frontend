import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

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
  { to: "/aanvraag/nieuw", label: "Nieuwe aanvraag" },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/aanvragen", label: "Aanvragen" },
  { to: "/admin/klanten", label: "Klanten" },
  { to: "/admin/regelingen", label: "Regelingen" },
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
    if (role === "admin") navLinks = adminLinks;
    else if (role === "installateur") navLinks = installateurLinks;
    else navLinks = klantLinks;
  }
  let homeForRole = "/dashboard";
  if (role === "admin") homeForRole = "/admin/dashboard";
  else if (role === "installateur") homeForRole = "/installateur/dashboard";

  function logout() {
    removeToken();
    setAuthed(false);
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="container-app flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green font-extrabold text-white">
              A
            </span>
            <span className="text-lg font-bold text-gray-900">
              AAA-Subsidies
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive
                      ? "text-brand-green"
                      : "text-gray-600 hover:text-brand-green"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {authed ? (
              <>
                {role === "admin" && (
                  <span className="hidden rounded-full bg-brand-greenLight px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green sm:inline">
                    Admin
                  </span>
                )}
                {role === "installateur" && (
                  <span className="hidden rounded-full bg-brand-greenLight px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green sm:inline">
                    Installateur
                  </span>
                )}
                <Link
                  to={homeForRole}
                  className="hidden text-sm font-semibold text-gray-700 hover:text-brand-green sm:inline"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="btn-secondary !py-2 !px-4 text-sm"
                >
                  Uitloggen
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden text-sm font-semibold text-gray-700 hover:text-brand-green sm:inline"
                >
                  Inloggen
                </Link>
                <Link
                  to="/subsidiecheck"
                  className="btn-primary !py-2 !px-4 text-sm"
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
            <div className="font-bold text-brand-green">AAA-Lex Offices</div>
            <div>Subsidieaanvragen voor duurzame energie-investeringen.</div>
          </div>
          <div className="text-gray-500">
            © {new Date().getFullYear()} AAA-Lex Offices — app.aaa-lexoffices.nl
          </div>
        </div>
      </footer>
    </div>
  );
}
