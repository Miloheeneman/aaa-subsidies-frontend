import PageMeta from "../../components/PageMeta.jsx";
import Placeholder from "../../components/site/Placeholder.jsx";
import {
  CheckList,
  CtaBanner,
  ServiceHero,
  SplitSection,
} from "../../components/site/SiteSections.jsx";

const GRID_ITEMS = [
  "Exterieur",
  "Interieur",
  "Hoogtefotografie",
  "Video-presentatie",
  "Plattegrond 2D",
  "Plattegrond 3D",
];

export default function Fotografie() {
  return (
    <>
      <PageMeta
        fullTitle
        title="Vastgoedfotografie — AAA-Lex Offices"
        description="Professionele vastgoedfotografie door fotografen met bouwkundig inzicht. Videopresentatie, hoogtefotografie en Funda in Business plattegronden in 2D of 3D."
      />

      <ServiceHero
        eyebrow="Vastgoedfotografie"
        title="Professionele vastgoedfotografie"
        description="Van videopresentatie en hoogtefotografie tot plattegronden voor Funda in Business in 2D of 3D — onze fotografen hebben het bouwkundige oog dat uw object verdient."
        ctaPrimary={{ to: "/contact", label: "Vraag een offerte aan" }}
        placeholderLabel="Exterieur pand"
      />

      <SplitSection
        title="Bouwkundig inzicht maakt het verschil"
        placeholderLabel="Interieur shoot"
      >
        <p>
          Een goede foto verkoopt niet alleen het object, maar vertelt
          ook het verhaal van de bouwkundige kwaliteit. Doordat onze
          fotografen samenwerken met de ingenieurs van AAA-Lex, weten ze
          exact welke details relevant zijn voor de doelgroep — van
          installaties tot constructie.
        </p>
        <CheckList
          items={[
            "Fotografen met bouwkundig inzicht en sectorkennis",
            "Drone- en hoogtefotografie voor bedrijfspanden",
            "Video-presentaties voor marketing en verhuur",
            "Plattegronden in 2D of 3D voor Funda in Business",
          ]}
        />
      </SplitSection>

      <section className="bg-gray-50">
        <div className="container-app py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
              Een greep uit ons werk
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Placeholderbeelden zolang de nieuwe portfolio nog wordt
              opgebouwd.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GRID_ITEMS.map((label) => (
              <Placeholder
                key={label}
                label={label}
                className="aspect-[4/3] shadow-sm"
              />
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        title="Uw object in beeld — op het niveau dat het verdient"
        description="Combineer fotografie met een meetstaat of energielabel en u heeft alles in één bezoek geregeld."
        primary={{ to: "/contact", label: "Vraag een offerte aan" }}
      />
    </>
  );
}
