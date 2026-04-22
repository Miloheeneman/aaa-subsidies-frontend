import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  getCurrentUser,
  isLoggedIn,
  onAuthChange,
  removeToken,
} from "../lib/auth.js";

const nav = [
  { to: "/admin", label: "📊 Dashboard", end: true },
  { to: "/admin/klanten", label: "👥 Klanten" },
  { to: "/admin/projecten", label: "📁 Projecten" },
  { to: "/admin/dossiers", label: "📋 Dossiers" },
  { to: "/admin/regelingen", label: "⚙️ Regelingen" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(isLoggedIn());

  useEffect(() => {
    const off = onAuthChange(() => setAuthed(isLoggedIn()));
    return off;
  }, []);

  function logout() {
    removeToken();
    navigate("/login", { replace: true });
  }

  const me = getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7f4]">
      <header
        className="border-b border-black/10 text-white"
        style={{ backgroundColor: "#1a3a1a" }}
      >
        <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link to="/admin" className="flex shrink-0 items-center gap-2">
              <img
                src="/aaa-subsidies-logo.svg"
                alt="AAA-Subsidies"
                className="h-10 w-auto brightness-0 invert"
              />
              <span className="hidden text-xs font-bold uppercase tracking-wider text-white/90 sm:inline">
                Admin
              </span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "rounded-lg px-3 py-2 text-sm font-semibold transition",
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/85 hover:bg-white/10 hover:text-white",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/"
              className="hidden text-xs font-semibold text-white/80 hover:text-white sm:inline"
            >
              Publieke site
            </Link>
            {me?.email && (
              <span className="hidden max-w-[140px] truncate text-xs text-white/70 lg:inline">
                {me.email}
              </span>
            )}
            {authed && (
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Uitloggen
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto border-t border-white/10 px-2 py-2 md:hidden">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/85 hover:bg-white/10",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
        AAA-Subsidies admin ·{" "}
        <Link to="/admin/aanvragen" className="text-brand-green hover:underline">
          Klassieke aanvragen
        </Link>
      </footer>
    </div>
  );
}
