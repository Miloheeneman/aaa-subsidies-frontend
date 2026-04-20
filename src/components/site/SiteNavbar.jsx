import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

export const SITE_SERVICES = [
  {
    to: "/diensten/energielabels",
    label: "Energielabels",
    description: "EP-W en EP-U labels voor woningen en utiliteit.",
  },
  {
    to: "/diensten/meetstaten",
    label: "Meetstaten & NEN 2580",
    description: "Professionele oppervlaktemeting met meetrapport.",
  },
  {
    to: "/diensten/epa-advies",
    label: "EPA-adviezen",
    description: "EPA-U Basis, Detail en Maatwerkadvies.",
  },
  {
    to: "/diensten/subsidies",
    label: "Verduurzaming & Subsidies",
    description: "ISDE, EIA, MIA/Vamil en DUMAVA — in één portaal.",
  },
  {
    to: "/diensten/fotografie",
    label: "Vastgoedfotografie",
    description: "Professionele fotografie, video en 2D/3D plattegronden.",
  },
  {
    to: "/diensten/bouwkundig-ontwerp",
    label: "Bouwkundig ontwerp",
    description: "Integraal ontwerpen en bouwbegeleiding.",
  },
];

const MAIN_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/over-ons", label: "Over ons" },
  { to: "/referenties", label: "Referenties" },
  { to: "/contact", label: "Contact" },
];

export default function SiteNavbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesRef = useRef(null);

  // Close all menus on route change.
  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  // Close the services dropdown on outside click / Escape.
  useEffect(() => {
    if (!servicesOpen) return undefined;
    function onClick(e) {
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setServicesOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [servicesOpen]);

  const servicesActive = location.pathname.startsWith("/diensten");

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="AAA-Lex Offices — home"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green font-extrabold text-white"
          >
            A
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-extrabold text-gray-900">
              AAA-Lex Offices
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand-green">
              Sustainable Building Support
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-semibold transition ${
                isActive
                  ? "text-brand-green"
                  : "text-gray-700 hover:text-brand-green"
              }`
            }
          >
            Home
          </NavLink>

          <div className="relative" ref={servicesRef}>
            <button
              type="button"
              onClick={() => setServicesOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={servicesOpen}
              className={`flex items-center gap-1 text-sm font-semibold transition ${
                servicesActive || servicesOpen
                  ? "text-brand-green"
                  : "text-gray-700 hover:text-brand-green"
              }`}
            >
              Diensten
              <svg
                aria-hidden="true"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
                className={`transition-transform ${
                  servicesOpen ? "rotate-180" : ""
                }`}
              >
                <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
            {servicesOpen && (
              <div
                role="menu"
                className="absolute left-1/2 top-full z-50 mt-3 w-[34rem] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl"
              >
                <Link
                  role="menuitem"
                  to="/diensten"
                  className="mb-1 flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-brand-green hover:bg-brand-greenLight"
                >
                  Alle diensten bekijken →
                </Link>
                <div className="grid grid-cols-2 gap-1">
                  {SITE_SERVICES.map((svc) => (
                    <Link
                      key={svc.to}
                      role="menuitem"
                      to={svc.to}
                      className="group flex flex-col gap-0.5 rounded-lg p-3 transition hover:bg-brand-greenLight"
                    >
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-brand-green">
                        {svc.label}
                      </span>
                      <span className="text-xs text-gray-600">
                        {svc.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {MAIN_LINKS.filter((l) => l.to !== "/").map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-semibold transition ${
                  isActive
                    ? "text-brand-green"
                    : "text-gray-700 hover:text-brand-green"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className="text-sm font-semibold text-gray-700 hover:text-brand-green"
          >
            Inloggen
          </Link>
          <Link to="/subsidiecheck" className="btn-primary !py-2 !px-4 text-sm">
            Subsidiecheck
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? "Sluit menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 md:hidden"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            {menuOpen ? (
              <>
                <path d="M5 5l10 10" />
                <path d="M15 5l-10 10" />
              </>
            ) : (
              <>
                <path d="M3 6h14" />
                <path d="M3 10h14" />
                <path d="M3 14h14" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden">
          <div className="border-t border-gray-200 bg-white">
            <div className="container-app flex flex-col gap-1 py-4">
              <MobileLink to="/" end>
                Home
              </MobileLink>

              <button
                type="button"
                onClick={() => setMobileServicesOpen((o) => !o)}
                aria-expanded={mobileServicesOpen}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-brand-greenLight hover:text-brand-green"
              >
                Diensten
                <svg
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  className={`transition-transform ${
                    mobileServicesOpen ? "rotate-180" : ""
                  }`}
                >
                  <path d="M3.5 5.5l3.5 3.5 3.5-3.5" />
                </svg>
              </button>
              {mobileServicesOpen && (
                <div className="mb-1 ml-3 flex flex-col gap-1 border-l border-gray-100 pl-3">
                  <MobileLink to="/diensten" sub>
                    Overzicht
                  </MobileLink>
                  {SITE_SERVICES.map((svc) => (
                    <MobileLink key={svc.to} to={svc.to} sub>
                      {svc.label}
                    </MobileLink>
                  ))}
                </div>
              )}

              {MAIN_LINKS.filter((l) => l.to !== "/").map((l) => (
                <MobileLink key={l.to} to={l.to}>
                  {l.label}
                </MobileLink>
              ))}

              <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Inloggen
                </Link>
                <Link
                  to="/subsidiecheck"
                  className="btn-primary !py-2 !px-4 text-sm"
                >
                  Subsidiecheck
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({ to, end = false, sub = false, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-brand-greenLight text-brand-green"
            : sub
            ? "text-gray-700 hover:bg-brand-greenLight hover:text-brand-green"
            : "text-gray-800 hover:bg-brand-greenLight hover:text-brand-green"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
