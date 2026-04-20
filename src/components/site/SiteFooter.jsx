import { Link } from "react-router-dom";

import { SITE_SERVICES } from "./SiteNavbar.jsx";

export default function SiteFooter() {
  return (
    <footer className="bg-brand-green text-white">
      <div className="container-app grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-extrabold text-brand-green"
            >
              A
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-base font-extrabold">AAA-Lex Offices</span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/70">
                Sustainable Building Support
              </span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            Onafhankelijk ingenieursbureau gespecialiseerd in energielabels,
            meetstaten, EPA-adviezen en verduurzaming van vastgoed.
          </p>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/70">
            Diensten
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {SITE_SERVICES.map((svc) => (
              <li key={svc.to}>
                <Link
                  to={svc.to}
                  className="text-white/90 transition hover:text-white hover:underline"
                >
                  {svc.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/70">
            Organisatie
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link
                to="/"
                className="text-white/90 transition hover:text-white hover:underline"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/over-ons"
                className="text-white/90 transition hover:text-white hover:underline"
              >
                Over ons
              </Link>
            </li>
            <li>
              <Link
                to="/referenties"
                className="text-white/90 transition hover:text-white hover:underline"
              >
                Referenties
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-white/90 transition hover:text-white hover:underline"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/subsidiecheck"
                className="text-white/90 transition hover:text-white hover:underline"
              >
                Subsidiecheck
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="text-white/90 transition hover:text-white hover:underline"
              >
                Inloggen
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/70">
            Contact
          </div>
          <address className="mt-4 space-y-1 text-sm not-italic text-white/90">
            <div className="font-semibold text-white">AAA-Lex Offices B.V.</div>
            <div>Rokkeveenseweg 40A</div>
            <div>2712 XZ Zoetermeer</div>
            <div className="pt-2">
              T:{" "}
              <a
                href="tel:+31707530088"
                className="transition hover:text-white hover:underline"
              >
                +31 (0)70 – 753 00 88
              </a>
            </div>
            <div>
              E:{" "}
              <a
                href="mailto:info@aaa-lexoffices.nl"
                className="transition hover:text-white hover:underline"
              >
                info@aaa-lexoffices.nl
              </a>
            </div>
          </address>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-app flex flex-col items-start justify-between gap-2 py-5 text-xs text-white/70 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} AAA-Lex Offices B.V.</span>
          <span>KvK ingeschreven in Zoetermeer — alle rechten voorbehouden.</span>
        </div>
      </div>
    </footer>
  );
}
