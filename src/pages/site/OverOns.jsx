import PageMeta from "../../components/PageMeta.jsx";
import Placeholder from "../../components/site/Placeholder.jsx";
import {
  CheckList,
  CtaBanner,
  ServiceHero,
  SplitSection,
} from "../../components/site/SiteSections.jsx";

const TEAM = [
  {
    name: "ir. R. Roelofs",
    role: "Project Manager EP-W / EP-U / EP-D / MWA / NEN 2580",
  },
  {
    name: "C. Heeneman",
    role: "Project Manager EP-W / EP-U",
  },
];

export default function OverOns() {
  return (
    <>
      <PageMeta
        fullTitle
        title="Over ons — AAA-Lex Offices"
        description="AAA-Lex Offices is een onafhankelijk ingenieursbureau in Zoetermeer, opgericht in 2017. Een horizontaal team van bouwkundig ingenieurs en professionele fotografen."
      />

      <ServiceHero
        eyebrow="Over AAA-Lex Offices"
        title="Een onafhankelijk ingenieursbureau met maatwerk als standaard"
        description="Opgericht in 2017 en gevestigd in Zoetermeer. Ons team bestaat uit bouwkundig ingenieurs en professionele fotografen die samen een complete technische basis leveren voor uw vastgoedobject."
        placeholderLabel="Team AAA-Lex"
        ctaPrimary={{ to: "/contact", label: "Neem contact op" }}
        ctaSecondary={{ to: "/diensten", label: "Bekijk diensten" }}
      />

      <SplitSection
        title="Onze aanpak: horizontaal en betrokken"
        placeholderLabel="Kantoor Zoetermeer"
      >
        <p>
          AAA-Lex Offices is een <strong>horizontale organisatie</strong> zonder
          lange hiërarchische lijnen. Dat zorgt voor snelle
          besluitvorming, korte communicatielijnen en projectteams die
          zich persoonlijk verantwoordelijk voelen voor het resultaat.
        </p>
        <p>
          Elk project is maatwerk. Daarom krijgt u bij AAA-Lex altijd een
          vast aanspreekpunt — van offerte tot oplevering. Zo weet u altijd
          bij wie u terecht kunt en voorkomen we dat informatie tussen
          disciplines verloren gaat.
        </p>
        <CheckList
          items={[
            "Onafhankelijk ingenieursbureau — geen bindingen met installateurs",
            "Horizontale organisatie met korte lijnen",
            "Vast aanspreekpunt per project",
            "Kernteam van bouwkundig ingenieurs en fotografen",
          ]}
        />
      </SplitSection>

      <SplitSection
        title="Voor wie werken we?"
        placeholderLabel="Samenwerkende partijen"
        reverse
      >
        <p>
          AAA-Lex werkt voor een brede mix van opdrachtgevers. Denk aan
          vastgoedbeheerders en woningcorporaties, makelaars en
          taxateurs, adviesbureaus, accountants en
          projectontwikkelaars. Steeds vaker ook voor eindgebruikers
          die via onze partners bij ons terechtkomen.
        </p>
        <CheckList
          items={[
            "Vastgoedbeheerders en corporaties",
            "Makelaars en taxateurs",
            "Advies- en accountancybureaus",
            "Projectontwikkelaars",
            "Particuliere eigenaren en bedrijven",
          ]}
        />
      </SplitSection>

      <section className="bg-gray-50">
        <div className="container-app py-14 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
              Ons team
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Een kernteam van gecertificeerde adviseurs — aangevuld met
              specialisten per project.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm"
              >
                <Placeholder
                  label="Portret"
                  className="h-32 w-32 !aspect-square !rounded-full"
                  rounded=""
                />
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        title="Benieuwd wat we voor uw object kunnen betekenen?"
        description="In een intake van 20 minuten brengen we uw vraag scherp in beeld — en weet u welke route bij uw project past."
        primary={{ to: "/contact", label: "Plan een intake" }}
        secondary={{ to: "/referenties", label: "Bekijk referenties" }}
      />
    </>
  );
}
