import { useState } from "react";
import { Link } from "react-router-dom";

import PageMeta from "../components/PageMeta.jsx";

const fases = [
  {
    nummer: "01",
    titel: "Onderzoeken",
    subtitel: "Gratis subsidiescan",
    bg: "bg-brand-greenLight",
    accent: "text-brand-green",
    badge: "bg-brand-green text-white",
    bullets: [
      "U doet de subsidiecheck op onze website (5 minuten)",
      "Wij beoordelen uw kansen en sturen u een analyse",
      "U ontvangt een voorstel van AAA-Lex",
    ],
  },
  {
    nummer: "02",
    titel: "Aanvragen",
    subtitel: "Dossier & indiening",
    bg: "bg-brand-green",
    accent: "text-white",
    badge: "bg-white text-brand-green",
    bullets: [
      "U maakt een account aan en uploadt uw documenten",
      "Wij controleren het dossier op volledigheid",
      "Wij dienen in bij RVO namens u als erkend intermediair",
      "Wij bewaken alle deadlines en indientermijnen",
    ],
    donker: true,
  },
  {
    nummer: "03",
    titel: "Verantwoorden",
    subtitel: "Goedkeuring & uitbetaling",
    bg: "bg-brand-greenLight",
    accent: "text-brand-green",
    badge: "bg-brand-green text-white",
    bullets: [
      "RVO beoordeelt uw aanvraag binnen 13 weken",
      "Bij goedkeuring ontvangt u de subsidie",
      "AAA-Lex ontvangt de succesfee (4–10% afhankelijk van de regeling)",
      "Geen goedkeuring = geen kosten",
    ],
  },
];

const documentenPerRegeling = [
  {
    code: "ISDE",
    titel: "ISDE — Warmtepomp",
    must: [
      "Meldcode van de warmtepomp (staat op de factuur)",
      "Factuur + betaalbewijs met installatiedatum",
      "Naam en KvK-nummer van het installatiebedrijf",
      "Inbedrijfsstellingsformulier (ingevuld door de monteur)",
    ],
    warnings: [
      "Bouwjaar woning moet vóór 2019 zijn",
      "Aanvragen binnen 24 maanden na installatie",
    ],
  },
  {
    code: "ISDE",
    titel: "ISDE — Isolatie",
    must: [
      "Meldcode van het isolatiemateriaal (staat op de factuur)",
      "Factuur + betaalbewijs",
      "Foto's tijdens de werkzaamheden (naam/merk/dikte materiaal zichtbaar)",
    ],
    warnings: ["Aanvragen binnen 24 maanden na installatie"],
  },
  {
    code: "EIA",
    titel: "EIA — zakelijk",
    must: [
      "Offerte van de investering",
      "KvK-uittreksel",
      "Specificatie van de investering",
    ],
    warnings: [
      "Kritiek: aanvragen VÓÓR u de offerte ondertekent",
      "Binnen 3 maanden na offertedatum",
    ],
  },
  {
    code: "MIA / Vamil",
    titel: "MIA + Vamil (altijd combineren)",
    must: [
      "Zelfde documenten als EIA",
      "Milieulijst-categoriecode voor uw investering",
    ],
    warnings: ["Kritiek: aanvragen VÓÓR u de offerte ondertekent"],
  },
];

const faqItems = [
  {
    q: "Vraagt u de subsidie aan vóór of na de werkzaamheden?",
    a: "Dat hangt af van de regeling. ISDE vraagt u aan ná installatie (binnen 24 maanden). EIA en MIA/Vamil moet u aanvragen VÓÓR u akkoord geeft op een offerte. Ons platform geeft per aanvraag precies aan wanneer u moet indienen.",
  },
  {
    q: "Heb ik een DigiD of eHerkenning nodig?",
    a: "Nee. AAA-Lex dient namens u in als erkend intermediair. U heeft alleen de benodigde documenten nodig.",
  },
  {
    q: "Hoe lang duurt een subsidieaanvraag?",
    a: "RVO beslist binnen 13 weken na indiening. Een volledig dossier versnelt dit aanzienlijk. Wij zorgen dat uw dossier de eerste keer compleet is.",
  },
  {
    q: "Wat als mijn aanvraag wordt afgewezen?",
    a: "No cure, no pay — u betaalt niets. Wij analyseren de reden van afwijzing en kijken of er een herstelverzoek of alternatieve regeling mogelijk is.",
  },
];

function FaseCard({ fase }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 shadow-sm ring-1 ring-black/5 sm:p-8 ${fase.bg}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-extrabold tracking-wide ${fase.badge}`}
        >
          {fase.nummer}
        </span>
        <div>
          <div
            className={`text-xs font-semibold uppercase tracking-wide ${
              fase.donker ? "text-white/80" : "text-gray-500"
            }`}
          >
            Fase {fase.nummer}
          </div>
          <div
            className={`text-xl font-bold ${
              fase.donker ? "text-white" : "text-gray-900"
            }`}
          >
            {fase.titel}
          </div>
        </div>
      </div>
      <div
        className={`mt-4 text-base font-semibold ${
          fase.donker ? "text-white" : "text-gray-900"
        }`}
      >
        {fase.subtitel}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {fase.bullets.map((b) => (
          <li
            key={b}
            className={`flex items-start gap-2 ${
              fase.donker ? "text-white/90" : "text-gray-700"
            }`}
          >
            <span
              aria-hidden="true"
              className={`mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full ${
                fase.donker ? "bg-white" : "bg-brand-green"
              }`}
            />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DocumentAccordion({ item, open, onToggle }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:text-brand-green"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-md bg-brand-green px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
            {item.code}
          </span>
          <span className="text-base font-semibold text-gray-900">
            {item.titel}
          </span>
        </div>
        <span
          aria-hidden="true"
          className={`flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-greenLight text-brand-green transition ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-700">
          <div className="mb-2 font-semibold text-gray-900">Wat u aanlevert</div>
          <ul className="space-y-1.5">
            {item.must.map((m) => (
              <li key={m} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-greenLight text-xs font-bold text-brand-green"
                >
                  ✓
                </span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
          {item.warnings.length > 0 && (
            <>
              <div className="mt-4 mb-2 font-semibold text-gray-900">
                Let op
              </div>
              <ul className="space-y-1.5">
                {item.warnings.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-amber-900">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700"
                    >
                      !
                    </span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-gray-900 hover:text-brand-green"
      >
        <span>{item.q}</span>
        <span
          aria-hidden="true"
          className={`flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-greenLight text-brand-green transition ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-700">
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function HoeHetWerkt() {
  const [openDoc, setOpenDoc] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div>
      <PageMeta
        title="Hoe het werkt"
        description="Subsidie aanvragen zonder gedoe — AAA-Lex begeleidt u van scan tot uitbetaling. Geen goedkeuring? Geen kosten."
      />

      <section className="bg-brand-greenLight">
        <div className="container-app py-16 md:py-20">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
              Werkwijze
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
              Subsidie aanvragen{" "}
              <span className="text-brand-green">zonder gedoe</span>.
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              AAA-Lex begeleidt u van scan tot uitbetaling. U levert de
              documenten, wij regelen de rest. Geen goedkeuring? Dan betaalt
              u niets.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/subsidiecheck" className="btn-primary">
                Gratis subsidiecheck
              </Link>
              <Link to="/register" className="btn-secondary">
                Account aanmaken
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-app py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900">
            In drie fases naar uw subsidie
          </h2>
          <p className="mt-3 text-gray-600">
            Elke fase heeft een vast contactmoment. U weet altijd waar uw
            dossier staat.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {fases.map((f) => (
            <FaseCard key={f.nummer} fase={f} />
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="container-app">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-900">
              Wat heeft u nodig per regeling?
            </h2>
            <p className="mt-3 text-gray-600">
              Klik een regeling open om te zien welke documenten wij van u
              nodig hebben — en waar u op moet letten.
            </p>
          </div>
          <div className="grid gap-3">
            {documentenPerRegeling.map((item, idx) => (
              <DocumentAccordion
                key={item.titel}
                item={item}
                open={openDoc === idx}
                onToggle={() => setOpenDoc(openDoc === idx ? -1 : idx)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="container-app py-16">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900">
            Veelgestelde vragen
          </h2>
          <p className="mt-3 text-gray-600">
            Nog iets onduidelijk? Onze adviseurs staan voor u klaar.
          </p>
        </div>
        <div className="grid gap-3">
          {faqItems.map((item, idx) => (
            <FaqItem
              key={item.q}
              item={item}
              open={openFaq === idx}
              onToggle={() => setOpenFaq(openFaq === idx ? -1 : idx)}
            />
          ))}
        </div>
      </section>

      <section className="bg-brand-greenLight py-14">
        <div className="container-app flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Start vrijblijvend met de subsidiecheck
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              In 5 minuten weet u welke regelingen op uw situatie van
              toepassing zijn.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/subsidiecheck" className="btn-primary">
              Gratis subsidiecheck
            </Link>
            <Link to="/register" className="btn-secondary">
              Account aanmaken
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
