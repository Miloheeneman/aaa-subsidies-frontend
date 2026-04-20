import PageMeta from "../../components/PageMeta.jsx";
import {
  CheckList,
  CtaBanner,
  ServiceHero,
  SplitSection,
  StepList,
} from "../../components/site/SiteSections.jsx";

const PHASES = [
  {
    title: "Schetsontwerp",
    body: "Eerste vertaling van uw programma van eisen naar een ruimtelijk concept en een globale begroting.",
  },
  {
    title: "Voorontwerp & DO",
    body: "Verdere uitwerking naar voor- en definitief ontwerp, inclusief constructieve en installatietechnische afstemming.",
  },
  {
    title: "Bouwbegeleiding",
    body: "Toezicht op kwaliteit, geld en tijd tijdens de uitvoering — met heldere rapportages aan de opdrachtgever.",
  },
];

export default function BouwkundigOntwerp() {
  return (
    <>
      <PageMeta
        fullTitle
        title="Bouwkundig ontwerp & begeleiding — AAA-Lex Offices"
        description="Integraal bouwkundig ontwerp en professionele bouwbegeleiding door ervaren ingenieurs. Van schets tot oplevering — één aanspreekpunt en toezicht op kwaliteit, geld en tijd."
      />

      <ServiceHero
        eyebrow="Bouwkundig ontwerp"
        title="Bouwkundig ontwerp & begeleiding"
        description="Integraal ontwerpen: het complete ontwerpproces onder één dak, van schetsontwerp tot oplevering. Door de integrale aanpak verloopt de afstemming tussen disciplines soepel en blijft de kwaliteit geborgd."
        ctaPrimary={{ to: "/contact", label: "Vraag een offerte aan" }}
        placeholderLabel="Ontwerptekeningen"
      />

      <SplitSection
        title="Integraal ontwerpen = beter eindresultaat"
        placeholderLabel="Bouwplaats"
      >
        <p>
          Bij integraal ontwerpen stemmen we bouwkunde, constructie,
          installaties en duurzaamheid vanaf de eerste schets op elkaar
          af. Dat voorkomt verrassingen tijdens de uitvoering en
          resulteert in een ontwerp dat technisch én financieel klopt.
        </p>
        <CheckList
          items={[
            "Eén ontwerpteam voor alle disciplines",
            "Duidelijke fasering met go/no-go momenten",
            "Duurzaamheid en subsidies vanaf de start meegenomen",
            "Naadloze overgang naar bouwbegeleiding",
          ]}
        />
      </SplitSection>

      <section className="bg-gray-50">
        <div className="container-app py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
              Van schets tot oplevering
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Drie fases waarin AAA-Lex uw project professioneel
              begeleidt.
            </p>
          </div>
          <div className="mt-10">
            <StepList steps={PHASES} />
          </div>
        </div>
      </section>

      <SplitSection
        title="Bouwbegeleiding: toezicht op drie assen"
        placeholderLabel="Opleverdossier"
        reverse
      >
        <p>
          Tijdens de uitvoering bewaken wij de uitvoering op drie assen:
          kwaliteit, geld en tijd. U ontvangt periodieke rapportages en
          heeft een vast aanspreekpunt dat wekelijks op de bouwplaats is
          te vinden.
        </p>
        <CheckList
          items={[
            "Toezicht op bouwkwaliteit en materiaalkeuze",
            "Meer- en minderwerk getoetst aan de aanneemsom",
            "Planningsbewaking met weekrapportages",
            "Opleverdossier inclusief alle as-built tekeningen",
          ]}
        />
      </SplitSection>

      <CtaBanner
        title="Plannen voor nieuwbouw, renovatie of transformatie?"
        description="Plan een intake en wij komen met een eerste lijnen van het ontwerp én een inschatting van de doorlooptijd."
        primary={{ to: "/contact", label: "Vraag een offerte aan" }}
      />
    </>
  );
}
