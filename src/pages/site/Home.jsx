import { Link } from "react-router-dom";

import PageMeta from "../../components/PageMeta.jsx";
import Placeholder from "../../components/site/Placeholder.jsx";
import {
  CtaBanner,
  StepList,
} from "../../components/site/SiteSections.jsx";
import { SITE_SERVICES } from "../../components/site/SiteNavbar.jsx";

const USPS = [
  {
    title: "Gecertificeerde specialisten",
    body: "Bouwkundig ingenieurs met jarenlange ervaring in energielabels, EPA en NEN 2580.",
  },
  {
    title: "Één contactmoment",
    body: "Wij brengen uw gehele gebouw in kaart in één bezoek — van meetstaat tot energielabel.",
  },
  {
    title: "Maatwerk per project",
    body: "Elk project krijgt een eigen plan van aanpak en een vast aanspreekpunt.",
  },
];

const STEPS = [
  {
    title: "Offerte & intake",
    body: "Binnen één werkdag ontvangt u een heldere offerte op basis van uw objectgegevens.",
  },
  {
    title: "Opname op locatie",
    body: "Onze ingenieur meet het object in, fotografeert indien gewenst en verzamelt de benodigde bewijsstukken.",
  },
  {
    title: "Rapport & advies",
    body: "U ontvangt een overzichtelijk rapport met meetstaat, energielabel en — indien relevant — een subsidieadvies.",
  },
];

export default function Home() {
  return (
    <>
      <PageMeta
        fullTitle
        title="AAA-Lex Offices — onafhankelijk ingenieursbureau"
        description="AAA-Lex Offices verzorgt energielabels, meetstaten (NEN 2580), EPA-adviezen, vastgoedfotografie en subsidieaanvragen voor vastgoedeigenaren."
      />

      {/* 1. Hero */}
      <section className="bg-brand-greenLight">
        <div className="container-app grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-block rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
              AAA-Lex Offices — sinds 2017
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
              Uw vastgoed{" "}
              <span className="text-brand-green">professioneel</span> in kaart
              gebracht
            </h1>
            <p className="mt-4 text-base leading-relaxed text-gray-700 md:text-lg">
              AAA-Lex Offices is een onafhankelijk ingenieursbureau
              gespecialiseerd in energielabels, meetstaten, EPA-adviezen en
              verduurzaming van vastgoed.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/diensten" className="btn-primary">
                Bekijk onze diensten
              </Link>
              <Link to="/subsidiecheck" className="btn-secondary">
                Gratis subsidiecheck
              </Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 text-sm">
              <div>
                <dt className="font-semibold text-brand-green">NEN 2580</dt>
                <dd className="text-gray-600">Meetstaten conform norm</dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-green">EP-W / EP-U</dt>
                <dd className="text-gray-600">Gecertificeerd adviseur</dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-green">RVO-erkend</dt>
                <dd className="text-gray-600">Subsidie-intermediair</dd>
              </div>
            </dl>
          </div>
          <div>
            <Placeholder
              label="Vastgoedimpressie"
              className="aspect-[5/4] shadow-md"
            />
          </div>
        </div>
      </section>

      {/* 2. Diensten overzicht */}
      <section className="bg-white">
        <div className="container-app py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
              Onze diensten
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Van opname tot registratie — wij leveren de volledige technische
              basis voor uw vastgoedobject.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SITE_SERVICES.map((svc) => (
              <ServiceCard key={svc.to} svc={svc} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/diensten" className="btn-secondary">
              Alle diensten bekijken
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Waarom AAA-Lex */}
      <section className="bg-gray-50">
        <div className="container-app py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
              Waarom AAA-Lex?
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Drie redenen waarom vastgoedbeheerders, makelaars en
              projectontwikkelaars met ons werken.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {USPS.map((usp) => (
              <div
                key={usp.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-greenLight text-xl font-bold text-brand-green"
                >
                  ✓
                </span>
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  {usp.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {usp.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Subsidies banner */}
      <CtaBanner
        title="Komt uw vastgoed in aanmerking voor subsidie?"
        description="Via ons platform checkt u in 5 stappen welke subsidies (ISDE, EIA, MIA/Vamil, DUMAVA) van toepassing zijn op uw situatie. Vrijblijvend en gratis."
        primary={{ to: "/subsidiecheck", label: "Start gratis subsidiecheck" }}
        secondary={{ to: "/diensten/subsidies", label: "Meer over subsidies" }}
      />

      {/* 5. Werkwijze */}
      <section className="bg-white">
        <div className="container-app py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
              Zo werken we
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Eén werkwijze voor elk project — transparant, planmatig en met
              een vast aanspreekpunt.
            </p>
          </div>
          <div className="mt-10">
            <StepList steps={STEPS} />
          </div>
        </div>
      </section>

      {/* 6. Contact CTA */}
      <section className="bg-brand-greenLight">
        <div className="container-app grid items-center gap-10 py-16 md:grid-cols-2 md:py-20">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
              Neem contact op
            </h2>
            <p className="mt-3 text-base leading-relaxed text-gray-700">
              Heeft u een vraag over een energielabel, een meetstaat of een
              volledige verduurzamingsopdracht? We denken graag met u mee.
            </p>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand-green">T:</span>
                <a
                  href="tel:+31707530088"
                  className="text-gray-800 hover:underline"
                >
                  +31 (0)70 – 753 00 88
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand-green">E:</span>
                <a
                  href="mailto:info@aaa-lexoffices.nl"
                  className="text-gray-800 hover:underline"
                >
                  info@aaa-lexoffices.nl
                </a>
              </div>
            </dl>
            <div className="mt-6">
              <Link to="/contact" className="btn-primary">
                Stuur een bericht
              </Link>
            </div>
          </div>
          <div>
            <Placeholder
              label="Kantoor Zoetermeer"
              className="aspect-[4/3] shadow-sm"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function ServiceCard({ svc }) {
  return (
    <Link
      to={svc.to}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-green/40 hover:shadow-md"
    >
      <Placeholder
        label={svc.label}
        rounded=""
        className="aspect-[16/10] border-0 border-b"
      />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-green">
          {svc.label}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
          {svc.description}
        </p>
        <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand-green">
          Meer info
          <span aria-hidden="true" className="ml-1">→</span>
        </span>
      </div>
    </Link>
  );
}
