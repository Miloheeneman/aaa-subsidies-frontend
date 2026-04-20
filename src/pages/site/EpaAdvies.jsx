import PageMeta from "../../components/PageMeta.jsx";
import {
  CheckList,
  CtaBanner,
  ServiceHero,
  SplitSection,
} from "../../components/site/SiteSections.jsx";

const PRODUCTEN = [
  {
    code: "EPA-U Basis",
    body: "Een globale analyse met verbetermaatregelen en indicatieve investerings- en besparingsgetallen.",
  },
  {
    code: "EPA-U Detail",
    body: "Een uitgebreide analyse met gedetailleerde berekeningen per maatregel en een doorrekening van scenario’s.",
  },
  {
    code: "EPA-U Maatwerkadvies",
    body: "Een volledig maatwerkadvies, inclusief rendement, terugverdientijd en advies over fiscale / subsidieroutes.",
  },
];

export default function EpaAdvies() {
  return (
    <>
      <PageMeta
        fullTitle
        title="EPA-adviezen — AAA-Lex Offices"
        description="EPA-U Basis, Detail en Maatwerkadvies door gecertificeerde EPA-adviseurs. Inzicht in energiebesparende maatregelen voor uw vastgoedobject."
      />

      <ServiceHero
        eyebrow="EPA-adviezen"
        title="EPA-adviezen voor optimale energieprestaties"
        description="Een EPA-U of EPA-W advies maakt inzichtelijk welke maatregelen effectief bijdragen aan een betere energieprestatie van uw gebouw — en wat dat kost én oplevert."
        ctaPrimary={{ to: "/contact", label: "Vraag een offerte aan" }}
        placeholderLabel="EPA rapport"
      />

      <SplitSection
        title="Inzicht in maatregelen én consequenties"
        placeholderLabel="Maatregelen analyse"
      >
        <p>
          Een EPA-advies gaat verder dan een energielabel: het vertaalt de
          gemeten situatie naar concrete verbetermaatregelen en rekent hun
          effect door op uw energieprestatie. Zo weet u vooraf wat een
          investering oplevert in termen van label-verbetering, kosten en
          terugverdientijd.
        </p>
        <p>
          Onze adviseurs zijn gecertificeerd en combineren bouwkundige
          kennis met installatietechnische expertise. Daardoor komen ze
          met maatregelenpakketten die écht bij uw gebouw passen.
        </p>
      </SplitSection>

      <section className="bg-gray-50">
        <div className="container-app py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
              Drie niveaus, één aanpak
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Afhankelijk van uw investeringsvraag kiest u het
              detailniveau dat het best past.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PRODUCTEN.map((p) => (
              <div
                key={p.code}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="inline-block self-start rounded-md bg-brand-greenLight px-2 py-1 text-xs font-bold text-brand-green">
                  {p.code}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-700">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SplitSection
        title="Resultaat: een label én een plan"
        placeholderLabel="Adviesrapport"
        reverse
      >
        <p>
          Het traject resulteert in een energielabel of — bij
          maatwerkadvies — een volledig verduurzamingsplan. Veel klanten
          gebruiken het advies als basis voor een bancaire financiering,
          een subsidieaanvraag of een investeringsbesluit van het
          directieteam.
        </p>
        <CheckList
          items={[
            "Gecertificeerde adviseur — erkend door RVO",
            "Concrete maatregelen met besparingsgetallen",
            "Advies over subsidie- en fiscale routes (EIA, MIA, ISDE)",
            "Rapport direct bruikbaar voor financiering",
          ]}
        />
      </SplitSection>

      <CtaBanner
        title="Start met een EPA-advies op maat"
        description="In een kort telefonisch intakegesprek bepalen we welk detailniveau bij uw object past. Zonder verplichtingen."
        primary={{ to: "/contact", label: "Vraag een offerte aan" }}
      />
    </>
  );
}
