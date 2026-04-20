import PageMeta from "../../components/PageMeta.jsx";
import {
  CheckList,
  CtaBanner,
  ServiceHero,
  SplitSection,
  StepList,
} from "../../components/site/SiteSections.jsx";

const STEPS = [
  {
    title: "Opname op locatie",
    body: "Onze gecertificeerde adviseur meet het object in en inventariseert de relevante bouwkundige en installatietechnische kenmerken.",
  },
  {
    title: "Berekening",
    body: "De gegevens worden verwerkt conform de NTA 8800 methodiek in erkende software.",
  },
  {
    title: "Registratie bij RVO",
    body: "Wij verzorgen de officiële registratie van uw energielabel bij RVO — u ontvangt direct het definitieve label.",
  },
];

export default function Energielabels() {
  return (
    <>
      <PageMeta
        fullTitle
        title="Energielabels — AAA-Lex Offices"
        description="Energielabels voor woningen (EP-W) en utiliteitsgebouwen (EP-U). AAA-Lex Offices is gecertificeerd adviseur en verzorgt opname, berekening en registratie bij RVO."
      />

      <ServiceHero
        eyebrow="Energielabels"
        title="Energielabels voor woningen en utiliteitsgebouwen"
        description="Als eigenaar van een object bent u in veel gevallen verplicht een geldig energielabel te laten registreren bij RVO. AAA-Lex is gecertificeerd voor zowel EP-W (woningen) als EP-U (utiliteitsgebouwen)."
        ctaPrimary={{ to: "/contact", label: "Vraag een offerte aan" }}
        ctaSecondary={{ to: "/subsidiecheck", label: "Doe de subsidiecheck" }}
        placeholderLabel="Woning & utiliteit"
      />

      <SplitSection
        title="Wat is een energielabel precies?"
        placeholderLabel="Voorbeeld energielabel"
      >
        <p>
          Een energielabel geeft inzicht in de energieprestatie van uw
          gebouw. Sinds 2021 is het label gebaseerd op de nieuwe NTA 8800
          methodiek en wordt de prestatie uitgedrukt in kWh per m² per jaar.
          Voor de verkoop, verhuur of oplevering van een gebouw is een
          geldig label wettelijk verplicht.
        </p>
        <p>
          AAA-Lex Offices werkt met gecertificeerde adviseurs die voor
          zowel EP-W als EP-U uw object kunnen opnemen en het label
          definitief kunnen registreren in de landelijke EP-online database
          van RVO.
        </p>
      </SplitSection>

      <section className="bg-gray-50">
        <div className="container-app py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
              Zo verloopt een energielabel-traject
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Van offerte tot registratie — gemiddeld binnen 2 weken
              afgerond.
            </p>
          </div>
          <div className="mt-10">
            <StepList steps={STEPS} />
          </div>
        </div>
      </section>

      <SplitSection title="Waarom AAA-Lex?" placeholderLabel="Adviseur op locatie" reverse>
        <p>
          Onze adviseurs zijn bouwkundig ingenieurs met ruime ervaring.
          Doordat wij het volledige traject in eigen hand houden — van
          opname tot registratie — houden wij de doorlooptijd kort en
          blijft de kwaliteit constant hoog.
        </p>
        <CheckList
          items={[
            "Gecertificeerd voor EP-W én EP-U",
            "Snelle doorlooptijd: gemiddeld 2 weken",
            "Opname en registratie door dezelfde ingenieur",
            "Vast tarief per objecttype — geen verrassingen",
          ]}
        />
      </SplitSection>

      <CtaBanner
        title="Klaar om uw energielabel te regelen?"
        description="Stuur ons uw objectgegevens en u ontvangt binnen één werkdag een heldere offerte."
        primary={{ to: "/contact", label: "Vraag een offerte aan" }}
      />
    </>
  );
}
