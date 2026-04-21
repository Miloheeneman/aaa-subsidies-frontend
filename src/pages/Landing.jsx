import { useState } from "react";
import { Link } from "react-router-dom";

import PageMeta from "../components/PageMeta.jsx";

const regelingen = [
  {
    code: "ISDE",
    titel: "ISDE",
    samenvatting:
      "Tot €5.200 subsidie voor warmtepompen en isolatie — voor particulieren en zakelijke verhuurders.",
    bullets: [
      "Warmtepompen, isolatie, HR++ glas",
      "Aanvragen ná installatie via RVO",
      "Werkbon + foto's verplicht",
    ],
  },
  {
    code: "EIA",
    titel: "EIA",
    samenvatting:
      "45,5% fiscale aftrek op uw investering in energiezuinige bedrijfsmiddelen.",
    bullets: [
      "Voor IB- of VPB-plichtige ondernemers",
      "Min. €2.500 per bedrijfsmiddel",
      "Deadline: 3 maanden na offerte",
    ],
  },
  {
    code: "MIA / Vamil",
    titel: "MIA + Vamil",
    samenvatting:
      "Tot 45% aftrek + liquiditeitsvoordeel via versnelde afschrijving — altijd gecombineerd aanvragen.",
    bullets: [
      "27–45% MIA-aftrek (Milieulijst)",
      "Vamil: 75% willekeurig afschrijven",
      "Deadline: 3 maanden na offerte",
    ],
  },
  {
    code: "DUMAVA",
    titel: "DUMAVA",
    samenvatting:
      "Tot 30% subsidie voor verduurzaming van maatschappelijk vastgoed, max. €1,5 miljoen per gebouw.",
    bullets: [
      "Zorg, onderwijs, sport, gemeenten",
      "Min. 2 maatregelen, 1 erkend",
      "Realisatie binnen 2 jaar",
    ],
  },
];

const trustItems = [
  {
    title: "No cure, no pay",
    body: "U betaalt alleen bij succes — wordt er niets toegekend, dan betaalt u niets.",
  },
  {
    title: "Gemiddeld 5–6 weken doorlooptijd",
    body: "Van intake tot indiening bij RVO — snel, zorgvuldig en volledig.",
  },
  {
    title: "Alle deadlines bewaakt",
    body: "AAA-Lex houdt elke indientermijn in de gaten, per regeling en per dossier.",
  },
];

const werkwijzeStappen = [
  {
    nummer: "01",
    titel: "Onderzoeken",
    body: "Gratis subsidiescan — wij brengen uw kansen in kaart. U ontvangt een indicatieve analyse van de regelingen die op uw situatie van toepassing zijn.",
  },
  {
    nummer: "02",
    titel: "Aanvragen",
    body: "Wij bouwen het dossier op en dienen in bij RVO namens u als erkend intermediair. Alle deadlines en indientermijnen bewaken wij automatisch.",
  },
  {
    nummer: "03",
    titel: "Verantwoorden",
    body: "Wij monitoren het proces na indiening. Bij goedkeuring ontvangt u de subsidie; AAA-Lex ontvangt dan pas de succesfee.",
  },
];

const doelgroepen = [
  {
    icon: "🏠",
    titel: "Woningen",
    beschrijving: "Eigenaar-bewoners en particuliere verhuurders.",
    regelingen: "ISDE warmtepomp, ISDE isolatie",
  },
  {
    icon: "🏢",
    titel: "Commercieel vastgoed",
    beschrijving: "Kantoren en bedrijfspanden.",
    regelingen: "EIA, MIA/Vamil",
  },
  {
    icon: "🏛️",
    titel: "Maatschappelijk vastgoed",
    beschrijving: "Zorg, onderwijs, sport en gemeenten.",
    regelingen: "DUMAVA (tot €1,5M per gebouw)",
  },
  {
    icon: "🏘️",
    titel: "VvE's",
    beschrijving: "Verenigingen van Eigenaren.",
    regelingen: "SVVE, ISDE",
  },
];

const faqItems = [
  {
    q: "Wat kost de dienstverlening van AAA-Lex?",
    a: "U betaalt geen kosten vooraf. AAA-Lex werkt op basis van een succesfee — een vast percentage van het toegekende subsidiebedrag (4–10% afhankelijk van de regeling). Wordt er niets toegekend, dan betaalt u niets.",
  },
  {
    q: "Hoe lang duurt een subsidieaanvraag?",
    a: "Vanaf intake tot indiening bij RVO duurt een dossier gemiddeld 5–6 weken. RVO neemt vervolgens 8–13 weken voor een beoordeling. Bij DUMAVA en EIA gelden specifieke deadlines die wij voor u bewaken.",
  },
  {
    q: "Kan ik meerdere subsidies combineren?",
    a: "Ja, in veel gevallen wel. MIA en Vamil dienen altijd samen te worden aangevraagd. EIA is niet stapelbaar met MIA op dezelfde investering, maar kan wel worden gecombineerd met andere regelingen op andere investeringen. Wij beoordelen dit per dossier.",
  },
  {
    q: "Wat als mijn aanvraag wordt afgewezen?",
    a: "Bij afwijzing betaalt u geen succesfee. Wij analyseren de motivatie, en bekijken of een hernieuwd of aanvullend dossier alsnog kans van slagen heeft (bijvoorbeeld via een andere regeling).",
  },
  {
    q: "Hoe werkt de AAA-Lex meting?",
    a: "Onze adviseur komt langs voor een opname van uw pand of installatie. Wij meten oppervlaktes, beoordelen het huidige energielabel en bepalen welke subsidiabele maatregelen het meeste opleveren. Het rapport koppelen wij direct aan uw account zodat de subsidiecheck automatisch is ingevuld.",
  },
];

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

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div>
      <PageMeta
        fullTitle
        title="AAA-Subsidies — duurzame subsidies eenvoudig aangevraagd"
        description="AAA-Lex Offices regelt uw ISDE, EIA, MIA, Vamil en DUMAVA aanvragen. Doe de gratis subsidiecheck en betaal alleen bij succes."
      />

      <section className="bg-brand-greenLight">
        <div className="container-app py-16 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
                AAA-Lex Offices
              </span>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
                Haal het maximale uit uw{" "}
                <span className="text-brand-green">duurzame subsidies</span>.
              </h1>
              <p className="mt-4 text-lg text-gray-700">
                Wij helpen particulieren, ondernemers en eigenaren van
                maatschappelijk vastgoed bij het aanvragen van subsidies
                voor warmtepompen, isolatie en verduurzaming. Start met
                een gratis subsidiecheck.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/subsidiecheck" className="btn-primary">
                  Gratis subsidiecheck
                </Link>
                <Link to="/register" className="btn-secondary">
                  Account aanmaken
                </Link>
              </div>
              <div className="mt-6 text-sm text-gray-600">
                Geen kosten vooraf — wij werken op basis van succesfee.
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5">
              <div className="text-sm font-semibold uppercase tracking-wide text-brand-green">
                In 5 stappen
              </div>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Subsidiecheck
              </h2>
              <ol className="mt-4 space-y-3 text-gray-700">
                {[
                  "Type aanvrager",
                  "Maatregel",
                  "Pandgegevens",
                  "Investering",
                  "Resultaat",
                ].map((label, idx) => (
                  <li key={label} className="flex gap-3">
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    {label}
                  </li>
                ))}
              </ol>
              <Link
                to="/subsidiecheck"
                className="btn-primary mt-6 w-full"
              >
                Start subsidiecheck
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-gray-200 bg-white">
        <div className="container-app grid gap-6 py-10 sm:grid-cols-3">
          {trustItems.map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <span className="mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-greenLight text-brand-green">
                ✓
              </span>
              <div>
                <div className="text-sm font-bold text-gray-900">
                  {t.title}
                </div>
                <div className="mt-0.5 text-sm text-gray-600">{t.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-app py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900">
            Regelingen waar wij in gespecialiseerd zijn
          </h2>
          <p className="mt-3 text-gray-600">
            Van ISDE tot DUMAVA — wij kennen de spelregels, deadlines en
            documentvereisten van elke regeling.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {regelingen.map((r) => (
            <div
              key={r.code}
              className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-brand-green hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-md bg-brand-green px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  {r.code}
                </span>
                <div className="text-xl font-bold text-gray-900">
                  {r.titel}
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700">{r.samenvatting}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {r.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full bg-brand-green" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="container-app">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-900">
              Subsidie zonder zorgen — wij regelen het
            </h2>
            <p className="mt-3 text-gray-600">
              In drie fases van scan tot uitbetaling. U levert de documenten,
              AAA-Lex bouwt en dient het dossier in.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {werkwijzeStappen.map((s) => (
              <div
                key={s.nummer}
                className="relative rounded-xl bg-white p-6 ring-1 ring-black/5"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green text-sm font-extrabold tracking-wide text-white">
                    {s.nummer}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">
                    {s.titel}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-700">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/hoe-het-werkt"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green hover:underline"
            >
              Bekijk de volledige werkwijze →
            </Link>
          </div>
        </div>
      </section>

      <section className="container-app py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900">
            Voor welk vastgoed regelen wij subsidies?
          </h2>
          <p className="mt-3 text-gray-600">
            Van particuliere woningen tot grote maatschappelijke
            vastgoedportefeuilles — wij kennen de regelingen die bij uw
            situatie horen.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {doelgroepen.map((d) => (
            <div
              key={d.titel}
              className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 transition hover:border-brand-green hover:shadow-md"
            >
              <div
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-greenLight text-2xl"
              >
                {d.icon}
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">
                {d.titel}
              </h3>
              <p className="mt-2 text-sm text-gray-700">{d.beschrijving}</p>
              <div className="mt-4 rounded-md bg-gray-50 p-3 text-xs font-semibold text-gray-700">
                <div className="uppercase tracking-wide text-gray-500">
                  Regelingen
                </div>
              <div className="mt-0.5 text-brand-green">{d.regelingen}</div>
            </div>
          </div>
        ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-app">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Van scan tot uitbetaling — wij regelen het
            </h2>
            <p className="mt-3 text-gray-600">
              Drie stappen, geen verrassingen, geen kosten vooraf.
            </p>
          </div>

          <ol className="grid gap-10 md:grid-cols-3 md:gap-0">
            {[
              {
                num: "01",
                titel: "Subsidiescan",
                body: "U doet in 5 minuten de gratis subsidiecheck. Wij beoordelen uw kansen en sturen u een persoonlijke analyse van passende regelingen.",
              },
              {
                num: "02",
                titel: "Dossier & Indiening",
                body: "U uploadt uw documenten via het platform. Wij controleren het dossier, bewaken alle deadlines en dienen in bij RVO namens u als erkend intermediair.",
              },
              {
                num: "03",
                titel: "Goedkeuring & Uitbetaling",
                body: "RVO beslist binnen 13 weken. Bij goedkeuring ontvangt u de subsidie direct. Geen goedkeuring? Dan betaalt u niets — no cure, no pay.",
              },
            ].map((stap, idx, arr) => (
              <li
                key={stap.num}
                className={`relative md:px-8 ${
                  idx < arr.length - 1
                    ? "md:border-r md:border-gray-200"
                    : ""
                }`}
              >
                <div
                  aria-hidden="true"
                  className="text-[64px] font-extrabold leading-none text-brand-green opacity-20"
                >
                  {stap.num}
                </div>
                <h3 className="mt-3 text-[20px] font-bold text-gray-900">
                  {stap.titel}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {stap.body}
                </p>

                {idx < arr.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-[-14px] top-10 hidden h-7 w-7 items-center justify-center text-gray-300 md:flex"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ol>

          <div className="mt-12">
            <Link
              to="/hoe-het-werkt"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-green hover:underline"
            >
              Lees hoe het precies werkt →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-brand-green py-16 text-white">
        <div className="container-app grid items-center gap-8 md:grid-cols-[2fr_1fr]">
          <div>
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Deadlines
            </span>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Mis nooit een deadline
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90">
              Voor zakelijke ISDE moet u aanvragen vóór de offerte. Voor
              particuliere ISDE heeft u 24 maanden na installatie. EIA en
              MIA/Vamil: aanvragen binnen 3 maanden na offerte. Ons
              platform bewaakt dit automatisch voor u.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <Link
              to="/subsidiecheck"
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-green transition hover:bg-white/90"
            >
              Start gratis subsidiecheck
            </Link>
            <Link
              to="/hoe-het-werkt"
              className="text-sm font-semibold text-white/90 hover:text-white hover:underline"
            >
              Bekijk alle deadlines per regeling →
            </Link>
          </div>
        </div>
      </section>

      <section className="container-app py-16">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-900">
            Veelgestelde vragen
          </h2>
          <p className="mt-3 text-gray-600">
            Geen passend antwoord? Neem direct contact op met AAA-Lex.
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
              Klaar om te starten?
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Doe in 2 minuten de gratis subsidiecheck — zonder verplichtingen.
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
