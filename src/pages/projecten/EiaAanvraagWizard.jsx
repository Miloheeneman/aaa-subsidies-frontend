import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import PageMeta from "../../components/PageMeta.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import { daysUntil, formatDate, formatEuro } from "../../lib/formatters.js";
import { getProject, submitEiaAanvraag } from "../../lib/projecten.js";

const FISCAAL_PCT = 0.455;
const FEE_PCT = 5;

const TYPE_INVESTERING_OPTIES = [
  { value: "led", label: "LED verlichting" },
  { value: "warmtepomp_zakelijk", label: "Warmtepomp zakelijk" },
  { value: "zonnepanelen", label: "Zonnepanelen" },
  {
    value: "energiezuinige_installatie",
    label: "Energiezuinige installatie",
  },
  { value: "overig", label: "Overig energiebesparend" },
];

const TYPE_ONDERNEMING_OPTIES = [
  { value: "ib", label: "IB-ondernemer (inkomstenbelasting)" },
  { value: "bv_nv", label: "BV / NV (vennootschapsbelasting)" },
  { value: "overig", label: "Overig" },
];

const MIN_INVESTERING = 2500;

const initialForm = {
  investering_omschrijving: "",
  type_investering: "led",
  investering_bedrag: "",
  geplande_startdatum: "",
  heeft_offerte: false,
  offerte_datum: "",
  bedrijfsnaam: "",
  kvk_nummer: "",
  type_onderneming: "ib",
  contactpersoon_naam: "",
  telefoon: "",
};

function parseEuroInput(raw) {
  if (raw === "" || raw == null) return null;
  const n = Number(String(raw).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Zelfde regel als backend: offertedatum + 90 dagen. */
function deadlineNaOfferteIso(offerteIso) {
  if (!offerteIso) return null;
  const d = new Date(`${offerteIso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + 90);
  return d.toISOString().slice(0, 10);
}

export default function EiaAanvraagWizard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [phase, setPhase] = useState("gate");
  const [form, setForm] = useState(initialForm);
  const [submitErr, setSubmitErr] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  const [investeringMinErr, setInvesteringMinErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getProject(projectId);
        if (!cancelled) {
          setProject(data);
          setLoadErr(null);
        }
      } catch (e) {
        if (!cancelled) setLoadErr(apiErrorMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const adresLabel = project
    ? `${project.straat} ${project.huisnummer}, ${project.postcode} ${project.plaats}`
    : "…";

  const investeringNum = useMemo(
    () => parseEuroInput(form.investering_bedrag),
    [form.investering_bedrag],
  );

  const fiscaalBedrag =
    investeringNum != null && investeringNum >= MIN_INVESTERING
      ? Math.round(investeringNum * FISCAAL_PCT * 100) / 100
      : null;
  const feeBedrag =
    fiscaalBedrag != null
      ? Math.round(fiscaalBedrag * (FEE_PCT / 100) * 100) / 100
      : null;

  const offerteDeadlineIso = useMemo(
    () =>
      form.heeft_offerte && form.offerte_datum
        ? deadlineNaOfferteIso(form.offerte_datum)
        : null,
    [form.heeft_offerte, form.offerte_datum],
  );

  const dagenTotDeadline =
    offerteDeadlineIso != null ? daysUntil(offerteDeadlineIso) : null;

  function setF(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function goBack() {
    setSubmitErr(null);
    if (phase === "done") return;
    if (phase === 3) setPhase(2);
    else if (phase === 2) setPhase(1);
    else if (phase === 1) setPhase("gate");
    else navigate(`/projecten/${projectId}`);
  }

  function validateStep1() {
    if (!form.investering_omschrijving.trim()) {
      alert("Vul een omschrijving van uw investering in.");
      return false;
    }
    return true;
  }

  function validateStep2() {
    const n = parseEuroInput(form.investering_bedrag);
    if (n == null) {
      alert("Vul het geschatte investeringsbedrag in.");
      setInvesteringMinErr(false);
      return false;
    }
    if (n < MIN_INVESTERING) {
      setInvesteringMinErr(true);
      return false;
    }
    setInvesteringMinErr(false);
    if (form.heeft_offerte && !form.offerte_datum) {
      alert("Vul de offertedatum in.");
      return false;
    }
    return true;
  }

  function validateStep3() {
    if (!form.bedrijfsnaam.trim()) {
      alert("Vul uw bedrijfsnaam in.");
      return false;
    }
    const kvkDigits = String(form.kvk_nummer).replace(/\D/g, "");
    if (kvkDigits.length !== 8) {
      alert("KvK-nummer moet 8 cijfers zijn.");
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    setSubmitErr(null);
    setSubmitting(true);
    const n = parseEuroInput(form.investering_bedrag);
    try {
      const body = {
        investering_omschrijving: form.investering_omschrijving.trim(),
        type_investering: form.type_investering,
        investering_bedrag: n,
        geplande_startdatum: form.geplande_startdatum || null,
        heeft_offerte: form.heeft_offerte,
        offerte_datum:
          form.heeft_offerte && form.offerte_datum
            ? form.offerte_datum
            : null,
        bedrijfsnaam: form.bedrijfsnaam.trim(),
        kvk_nummer: String(form.kvk_nummer).replace(/\D/g, ""),
        type_onderneming: form.type_onderneming,
        contactpersoon_naam: form.contactpersoon_naam.trim() || null,
        telefoon: form.telefoon.trim() || null,
      };
      const m = await submitEiaAanvraag(projectId, body);
      setCreated(m);
      setPhase("done");
    } catch (e) {
      setSubmitErr(apiErrorMessage(e, "Indienen mislukt"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadErr) {
    return (
      <div className="container-app py-10">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {loadErr}
        </div>
        <Link
          to={`/projecten/${projectId}`}
          className="mt-4 inline-block text-sm font-semibold text-brand-green hover:underline"
        >
          ← Terug naar project
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8 sm:py-10">
      <PageMeta title="EIA aanvraag" />

      <nav className="text-xs text-gray-500 sm:text-sm">
        <Link
          to="/projecten"
          className="font-semibold text-brand-green hover:underline"
        >
          Mijn projecten
        </Link>
        <span className="mx-2 text-gray-300">→</span>
        <Link
          to={`/projecten/${projectId}`}
          className="font-semibold text-brand-green hover:underline"
        >
          {adresLabel}
        </Link>
        <span className="mx-2 text-gray-300">→</span>
        <span className="font-semibold text-gray-800">EIA aanvraag</span>
      </nav>

      {phase !== "gate" && phase !== "done" && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
            <span>
              Stap {phase} van 3
            </span>
            <span>{Math.round((phase / 3) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand-green transition-all duration-300"
              style={{ width: `${(phase / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-8">
        {phase === "gate" && (
          <section className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 shadow-sm sm:p-8">
            <h1 className="text-xl font-extrabold text-amber-950 sm:text-2xl">
              ⚠ Lees dit eerst — belangrijk!
            </h1>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-amber-950/90">
              <p>
                Voor de EIA moet u de subsidie aanvragen VÓÓRDAT u akkoord gaat
                op een offerte of het apparaat bestelt.
              </p>
              <p>
                Heeft u al een offerte getekend of een bestelling geplaatst? Dan
                komt u mogelijk NIET meer in aanmerking voor EIA subsidie.
              </p>
              <p>
                Neem in dat geval eerst contact op met AAA-Lex voordat u verder
                gaat.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                className="btn-primary justify-center px-5 py-3 text-sm"
                onClick={() => setPhase(1)}
              >
                Ik heb nog geen offerte getekend → Doorgaan
              </button>
              <Link
                to="/contact"
                className="inline-flex justify-center rounded-xl border-2 border-amber-700 bg-white px-5 py-3 text-sm font-bold text-amber-900 hover:bg-amber-100"
              >
                Ik heb al een offerte getekend → Contact opnemen
              </Link>
            </div>
          </section>
        )}

        {phase === 1 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              Wat voor investering wilt u doen?
            </h2>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Omschrijving investering *
              <textarea
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                rows={4}
                value={form.investering_omschrijving}
                onChange={(e) =>
                  setF("investering_omschrijving", e.target.value)
                }
                placeholder="Bijv. LED verlichting voor kantoorpand"
              />
              <span className="mt-1 block text-xs font-normal text-gray-500">
                Beschrijf de energiebesparende investering die u wilt doen. Bijv:
                &apos;LED verlichting voor kantoorpand&apos; of &apos;Warmtepomp
                voor bedrijfspand&apos;
              </span>
            </label>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Type investering *
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                value={form.type_investering}
                onChange={(e) => setF("type_investering", e.target.value)}
              >
                {TYPE_INVESTERING_OPTIES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-6 rounded-xl border border-brand-green/30 bg-brand-greenLight/50 p-4 text-sm text-gray-800">
              De investering moet op de Energielijst van RVO staan. AAA-Lex
              controleert dit voor u en adviseert over de beste aanpak.
            </div>
            <button
              type="button"
              className="btn-primary mt-8 px-8 py-3"
              onClick={() => {
                if (validateStep1()) setPhase(2);
              }}
            >
              Volgende
            </button>
          </section>
        )}

        {phase === 2 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              Wat zijn de verwachte kosten?
            </h2>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Geschatte investering (€) *
              <input
                type="text"
                inputMode="decimal"
                className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none ring-brand-green focus:ring-2 ${
                  investeringMinErr
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-brand-green"
                }`}
                value={form.investering_bedrag}
                onChange={(e) => {
                  setF("investering_bedrag", e.target.value);
                  setInvesteringMinErr(false);
                }}
                placeholder="Minimaal €2.500"
              />
              {investeringMinErr && (
                <p className="mt-2 text-sm font-semibold text-red-700">
                  Minimale investering voor EIA is €2.500
                </p>
              )}
            </label>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Geplande startdatum
              <input
                type="date"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                value={form.geplande_startdatum}
                onChange={(e) => setF("geplande_startdatum", e.target.value)}
              />
            </label>
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-gray-800">
                Heeft u al een offerte?
              </legend>
              <div className="mt-2 flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="heeft_offerte"
                    checked={!form.heeft_offerte}
                    onChange={() => {
                      setF("heeft_offerte", false);
                      setF("offerte_datum", "");
                    }}
                  />
                  Nee
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="heeft_offerte"
                    checked={form.heeft_offerte}
                    onChange={() => setF("heeft_offerte", true)}
                  />
                  Ja
                </label>
              </div>
            </fieldset>
            {form.heeft_offerte && (
              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <label className="block text-sm font-semibold text-gray-800">
                  Offertedatum *
                  <input
                    type="date"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                    value={form.offerte_datum}
                    onChange={(e) => setF("offerte_datum", e.target.value)}
                  />
                </label>
                {offerteDeadlineIso && (
                  <>
                    <p className="mt-3 text-sm text-gray-700">
                      Deadline aanvragen bij RVO:{" "}
                      <strong>{formatDate(offerteDeadlineIso)}</strong>
                    </p>
                    {dagenTotDeadline != null && dagenTotDeadline < 30 && (
                      <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
                        Waarschuwing: er zijn minder dan 30 dagen tot deze
                        deadline. Neem direct contact op met AAA-Lex.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {fiscaalBedrag != null && (
              <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
                <p>
                  Fiscale aftrek (45,5%):{" "}
                  <strong>± {formatEuro(fiscaalBedrag)}</strong>
                </p>
                <p className="mt-1">
                  AAA-Lex fee ({FEE_PCT}%):{" "}
                  <strong>{formatEuro(feeBedrag)}</strong>
                </p>
              </div>
            )}
            <div className="mt-6 rounded-xl border border-brand-green/30 bg-brand-greenLight/50 p-4 text-sm text-gray-800">
              De EIA is een fiscale aftrek — geen directe subsidie. U trekt de
              aftrek op in uw belastingaangifte. Het voordeel hangt af van uw
              belastingtarief.
            </div>
            <button
              type="button"
              className="btn-primary mt-8 px-8 py-3"
              onClick={() => {
                if (validateStep2()) setPhase(3);
              }}
            >
              Volgende
            </button>
          </section>
        )}

        {phase === 3 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              Uw bedrijfsgegevens
            </h2>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Bedrijfsnaam *
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                value={form.bedrijfsnaam}
                onChange={(e) => setF("bedrijfsnaam", e.target.value)}
              />
            </label>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              KvK nummer *
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                value={form.kvk_nummer}
                onChange={(e) => setF("kvk_nummer", e.target.value)}
                placeholder="12345678"
              />
            </label>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Type onderneming *
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                value={form.type_onderneming}
                onChange={(e) => setF("type_onderneming", e.target.value)}
              >
                {TYPE_ONDERNEMING_OPTIES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Contactpersoon naam
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                value={form.contactpersoon_naam}
                onChange={(e) => setF("contactpersoon_naam", e.target.value)}
              />
            </label>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Telefoonnummer
              <input
                type="tel"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                value={form.telefoon}
                onChange={(e) => setF("telefoon", e.target.value)}
              />
            </label>
            <div className="mt-6 rounded-xl border border-brand-green/30 bg-brand-greenLight/50 p-4 text-sm text-gray-800">
              AAA-Lex heeft uw KvK gegevens nodig om de EIA aanvraag in te dienen
              bij RVO. Uw gegevens worden veilig opgeslagen.
            </div>
            {submitErr && (
              <p className="mt-4 text-sm font-semibold text-red-700">
                {submitErr}
              </p>
            )}
            <button
              type="button"
              className="btn-primary mt-8 px-8 py-3 disabled:opacity-60"
              disabled={submitting}
              onClick={() => {
                if (validateStep3()) handleSubmit();
              }}
            >
              {submitting ? "Bezig…" : "Aanvraag indienen"}
            </button>
          </section>
        )}

        {phase === "done" && created && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              Aanvraag ingediend bij AAA-Lex
            </h2>
            {form.heeft_offerte ? (
              <div className="mt-6 rounded-xl border border-orange-300 bg-orange-50 p-4 text-sm font-medium text-orange-950">
                Let op: u heeft aangegeven dat u al een offerte heeft. AAA-Lex
                neemt VANDAAG nog contact met u op om de deadline te bewaken.
              </div>
            ) : (
              <p className="mt-6 text-sm leading-relaxed text-gray-700">
                AAA-Lex neemt binnen 2 werkdagen contact met u op om de EIA
                aanvraag voor te bereiden.
              </p>
            )}
            <Link
              to={`/projecten/${projectId}/maatregelen/${created.id}`}
              className="btn-primary mt-8 inline-flex px-8 py-3"
            >
              Naar dossier
            </Link>
            <Link
              to={`/projecten/${projectId}`}
              className="ml-0 mt-3 inline-block text-sm font-semibold text-brand-green hover:underline sm:ml-4 sm:mt-0"
            >
              Terug naar project
            </Link>
          </section>
        )}
      </div>

      {phase !== "done" && (
        <div className="mt-10">
          <button
            type="button"
            onClick={goBack}
            className="text-sm font-semibold text-gray-600 hover:text-brand-green"
          >
            ← Terug
          </button>
        </div>
      )}
    </div>
  );
}
