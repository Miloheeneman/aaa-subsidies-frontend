import { Link } from "react-router-dom";

import PageMeta from "../../components/PageMeta.jsx";
import Placeholder from "../../components/site/Placeholder.jsx";
import { CtaBanner } from "../../components/site/SiteSections.jsx";

const DETAILED_SERVICES = [
  {
    to: "/diensten/energielabels",
    title: "Energielabels",
    blurb:
      "Gecertificeerd voor EP-W (woningen) en EP-U (utiliteitsgebouwen). Wij verzorgen de opname, berekening en registratie bij RVO.",
    points: ["EP-W (woningen)", "EP-U (utiliteit)", "Registratie bij RVO"],
  },
  {
    to: "/diensten/meetstaten",
    title: "Meetstaten & NEN 2580",
    blurb:
      "Professionele oppervlaktemeting met een inzichtelijk meetrapport conform NEN 2580. Onderscheid tussen BVO, GBO, VVO en meer.",
    points: ["Meetrapport met tekeningen", "Inclusief kadastrale gegevens", "NEN 2580-conform"],
  },
  {
    to: "/diensten/epa-advies",
    title: "EPA-adviezen",
    blurb:
      "Maatwerkadvies door gecertificeerde EPA-adviseurs. EPA-U Basis, Detail en Maatwerkadvies — passend bij uw investeringsvraag.",
    points: ["EPA-U Basis", "EPA-U Detail", "EPA-U Maatwerkadvies"],
  },
  {
    to: "/diensten/subsidies",
    title: "Verduurzaming & Subsidies",
    blurb:
      "ISDE, EIA, MIA/Vamil en DUMAVA — in één digitaal platform. Direct zicht op welke subsidies van toepassing zijn.",
    points: ["ISDE & DUMAVA", "EIA en MIA/Vamil", "Digitaal dossierbeheer"],
  },
  {
    to: "/diensten/fotografie",
    title: "Vastgoedfotografie",
    blurb:
      "Fotografen met bouwkundig inzicht. Van video- en hoogtefotografie tot Funda in Business plattegronden in 2D of 3D.",
    points: ["Drone- en hoogtefotografie", "2D en 3D plattegronden", "Funda in Business"],
  },
  {
    to: "/diensten/bouwkundig-ontwerp",
    title: "Bouwkundig ontwerp",
    blurb:
      "Integraal ontwerpen en professionele bouwbegeleiding. Toezicht op kwaliteit, geld en tijd — van schets tot oplevering.",
    points: ["Integraal ontwerpproces", "Bouwbegeleiding", "Toezicht op kwaliteit"],
  },
];

export default function Diensten() {
  return (
    <>
      <PageMeta
        fullTitle
        title="Diensten — AAA-Lex Offices"
        description="Een overzicht van alle diensten van AAA-Lex Offices: energielabels, meetstaten (NEN 2580), EPA-adviezen, subsidies, vastgoedfotografie en bouwkundig ontwerp."
      />

      <section className="bg-brand-greenLight">
        <div className="container-app py-14 md:py-20 text-center">
          <span className="inline-block rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
            Onze diensten
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-gray-900 md:text-4xl">
            Alles voor uw vastgoedobject, onder één dak
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
            Van energielabel tot subsidieaanvraag — onze ingenieurs,
            adviseurs en fotografen leveren de volledige technische basis voor
            uw object.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-app py-16 md:py-20">
          <div className="grid gap-8 lg:grid-cols-2">
            {DETAILED_SERVICES.map((svc) => (
              <article
                key={svc.to}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-green/40 hover:shadow-md lg:flex-row"
              >
                <div className="lg:w-2/5">
                  <Placeholder
                    label={svc.title}
                    rounded=""
                    className="aspect-[4/3] h-full border-0 lg:border-r"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-gray-900">
                    {svc.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {svc.blurb}
                  </p>
                  <ul className="mt-4 grid gap-1 text-sm text-gray-700">
                    {svc.points.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-greenLight text-brand-green"
                        >
                          ✓
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link
                      to={svc.to}
                      className="inline-flex items-center justify-center rounded-lg border border-brand-green bg-white px-4 py-2 text-sm font-semibold text-brand-green transition hover:bg-brand-greenLight"
                    >
                      Meer informatie →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        title="Niet zeker welke dienst bij uw project past?"
        description="Bespreek uw situatie telefonisch of per e-mail — vaak weten we binnen 5 minuten welke combinatie het beste past."
        primary={{ to: "/contact", label: "Neem contact op" }}
        secondary={{ to: "/subsidiecheck", label: "Doe de subsidiecheck" }}
      />
    </>
  );
}
