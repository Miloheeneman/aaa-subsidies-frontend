import { Link } from "react-router-dom";

import PageMeta from "../../components/PageMeta.jsx";
import {
  CheckList,
  CtaBanner,
  ServiceHero,
  SplitSection,
} from "../../components/site/SiteSections.jsx";

const REGELINGEN = [
  {
    code: "ISDE",
    title: "ISDE",
    body: "Tot €5.200 subsidie voor warmtepompen, zonneboilers en isolatie. Voor particulieren en zakelijke verhuurders.",
  },
  {
    code: "EIA",
    title: "EIA",
    body: "45,5% fiscale aftrek op uw investering in energiezuinige bedrijfsmiddelen — aanvraag binnen 3 maanden na opdracht.",
  },
  {
    code: "MIA / Vamil",
    title: "MIA + Vamil",
    body: "Tot 45% MIA-aftrek en 75% willekeurig afschrijven via Vamil. Altijd gecombineerd aanvragen.",
  },
  {
    code: "DUMAVA",
    title: "DUMAVA",
    body: "Tot 30% subsidie voor verduurzaming van maatschappelijk vastgoed, max. €1,5 miljoen per gebouw.",
  },
];

export default function Subsidies() {
  return (
    <>
      <PageMeta
        fullTitle
        title="Verduurzaming & Subsidies — AAA-Lex Offices"
        description="ISDE, EIA, MIA/Vamil en DUMAVA subsidies voor vastgoedverduurzaming. Check via ons digitale platform welke regelingen op uw situatie van toepassing zijn."
      />

      <ServiceHero
        eyebrow="Verduurzaming & Subsidies"
        title="Verduurzaming van uw vastgoed"
        description="Verduurzamen loont — zeker met de juiste combinatie van subsidies en fiscale regelingen. Via ons digitale platform heeft u direct zicht op welke regelingen van toepassing zijn."
        ctaPrimary={{ to: "/subsidiecheck", label: "Start gratis subsidiecheck" }}
        ctaSecondary={{ to: "/register", label: "Maak een account aan" }}
        placeholderLabel="Verduurzamingsproject"
      />

      <section className="bg-white">
        <div className="container-app py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
              Welke subsidies zijn beschikbaar?
            </h2>
            <p className="mt-3 text-base text-gray-600">
              De vier belangrijkste regelingen voor vastgoedverduurzaming
              — in één oogopslag.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {REGELINGEN.map((r) => (
              <div
                key={r.code}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <span className="inline-block rounded-md bg-brand-greenLight px-2 py-1 text-xs font-bold text-brand-green">
                  {r.code}
                </span>
                <h3 className="mt-3 text-lg font-bold text-gray-900">
                  {r.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SplitSection
        title="Eén platform voor uw volledige dossier"
        placeholderLabel="AAA-Subsidies portaal"
      >
        <p>
          Via ons digitale platform <strong>AAA-Subsidies</strong> checkt u
          in 5 stappen welke subsidies van toepassing zijn op uw
          situatie. Is er een match? Dan opent u direct een dossier,
          upload u de vereiste documenten en bewaken wij de deadlines.
        </p>
        <CheckList
          items={[
            "5-staps check: vraag naar vraag, zonder jargon",
            "Digitaal dossierbeheer — altijd toegang tot uw aanvraag",
            "Automatische deadlinebewaking (EIA, DUMAVA)",
            "Succesfee van 4–10% — u betaalt alleen bij toekenning",
          ]}
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/subsidiecheck" className="btn-primary">
            Start gratis subsidiecheck
          </Link>
          <Link to="/register" className="btn-secondary">
            Maak een account aan
          </Link>
        </div>
      </SplitSection>

      <CtaBanner
        title="Welke subsidie past bij uw project?"
        description="Doe de gratis check — in 5 korte stappen ziet u welke regelingen op uw situatie van toepassing zijn."
        primary={{ to: "/subsidiecheck", label: "Start gratis subsidiecheck" }}
        secondary={{ to: "/contact", label: "Bel met een adviseur" }}
      />
    </>
  );
}
