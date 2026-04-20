import PageMeta from "../../components/PageMeta.jsx";
import {
  CheckList,
  CtaBanner,
  ServiceHero,
  SplitSection,
} from "../../components/site/SiteSections.jsx";

const OPPERVLAKTES = [
  { code: "BVO", label: "Bruto vloeroppervlakte" },
  { code: "GBO", label: "Gebruiksoppervlakte" },
  { code: "VVO", label: "Verhuurbaar vloeroppervlakte" },
  { code: "NVO", label: "Netto vloeroppervlakte" },
  { code: "BBV", label: "Bruto bouwvolume" },
];

export default function Meetstaten() {
  return (
    <>
      <PageMeta
        fullTitle
        title="Meetstaten & NEN 2580 — AAA-Lex Offices"
        description="Professionele oppervlaktemeting conform NEN 2580 door bouwkundig ingenieurs. Inzichtelijk meetrapport inclusief tekeningen en kadastrale gegevens."
      />

      <ServiceHero
        eyebrow="Meetstaten"
        title="Meetstaten conform NEN 2580"
        description="Bij verkoop, verhuur, taxatie of verduurzaming is een betrouwbare meetstaat onmisbaar. AAA-Lex Offices meet uw vastgoedobject professioneel in — volledig conform de NEN 2580 norm."
        ctaPrimary={{ to: "/contact", label: "Vraag een offerte aan" }}
        placeholderLabel="Meetrapport"
      />

      <SplitSection
        title="Een inzichtelijk meetrapport"
        placeholderLabel="Plattegrond met oppervlaktes"
      >
        <p>
          Onze meetrapporten zijn zo opgebouwd dat u in één oogopslag ziet
          welke oppervlakte bij welk gedeelte van het object hoort. Bij
          elk rapport ontvangt u heldere tekeningen waarop BVO, GBO en VVO
          afzonderlijk zijn aangeduid.
        </p>
        <p>
          Kadastrale gegevens worden standaard meegenomen, zodat uw
          meetstaat aansluit op de BAG-registratie en direct bruikbaar is
          voor taxatie, verhuur of aanvragen bij de gemeente.
        </p>
      </SplitSection>

      <section className="bg-gray-50">
        <div className="container-app py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
              Onderscheid tussen oppervlaktes
            </h2>
            <p className="mt-3 text-base text-gray-600">
              De NEN 2580 kent verschillende oppervlaktedefinities. Wij
              leveren ze allemaal — keurig uitgesplitst in uw meetrapport.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OPPERVLAKTES.map((item) => (
              <div
                key={item.code}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <span className="inline-block rounded-md bg-brand-greenLight px-2 py-1 text-xs font-bold text-brand-green">
                  {item.code}
                </span>
                <div className="mt-2 text-base font-semibold text-gray-900">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SplitSection
        title="Waarom een professionele meetstaat?"
        placeholderLabel="Lasermeting"
        reverse
      >
        <CheckList
          items={[
            "Conform de NEN 2580 norm",
            "Bruikbaar voor verhuur, verkoop, taxatie en BAG",
            "Inclusief tekeningen op schaal",
            "Kadastrale gegevens standaard meegenomen",
            "Snelle levering: meestal binnen 10 werkdagen",
          ]}
        />
      </SplitSection>

      <CtaBanner
        title="Benodigd voor verhuur, taxatie of renovatie?"
        description="Met een NEN 2580-meetstaat van AAA-Lex legt u een betrouwbare basis voor ieder vastgoeddossier."
        primary={{ to: "/contact", label: "Vraag een offerte aan" }}
      />
    </>
  );
}
