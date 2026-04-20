import PageMeta from "../../components/PageMeta.jsx";
import Placeholder from "../../components/site/Placeholder.jsx";
import { CtaBanner } from "../../components/site/SiteSections.jsx";

const PROJECTS = [
  { type: "Boetiek", location: "Stadscentrum" },
  { type: "Kantoorgebouw", location: "Zuidas" },
  { type: "Appartementencomplex", location: "Rotterdam-Zuid" },
  { type: "Industriële hal", location: "Haven-industrieel gebied" },
  { type: "Zorginstelling", location: "Utrecht" },
  { type: "School", location: "Den Haag" },
];

export default function Referenties() {
  return (
    <>
      <PageMeta
        fullTitle
        title="Referenties — AAA-Lex Offices"
        description="Een selectie van vastgoedprojecten waarbij AAA-Lex Offices verantwoordelijk was voor energielabels, meetstaten, EPA-adviezen of subsidieaanvragen."
      />

      <section className="bg-brand-greenLight">
        <div className="container-app py-14 md:py-20 text-center">
          <span className="inline-block rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
            Referenties
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-gray-900 md:text-4xl">
            Onze projecten
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
            Van boetiek tot grote industriële hal — wij zien elk project
            als een uitdaging en een kans om onze kwaliteit te laten zien.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-app py-16 md:py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((project) => (
              <article
                key={`${project.type}-${project.location}`}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-green/40 hover:shadow-md"
              >
                <Placeholder
                  label={project.type}
                  rounded=""
                  className="aspect-[4/3] border-0 border-b"
                />
                <div className="p-5">
                  <div className="text-xs font-semibold uppercase tracking-widest text-brand-green">
                    {project.type}
                  </div>
                  <div className="mt-2 text-base font-bold text-gray-900">
                    {project.location}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Meerdere diensten gecombineerd — referentie op
                    aanvraag beschikbaar.
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        title="Heeft u een project voor AAA-Lex?"
        description="We bespreken het vrijblijvend en koppelen een ingenieur aan u die past bij het type project."
        primary={{ to: "/contact", label: "Neem contact op" }}
        secondary={{ to: "/diensten", label: "Bekijk diensten" }}
      />
    </>
  );
}
