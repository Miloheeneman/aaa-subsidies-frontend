import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import PageMeta from "../../components/PageMeta.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import { formatEuro } from "../../lib/formatters.js";
import { ENERGIELABELS, getProject, submitDumavaAanvraag } from "../../lib/projecten.js";

const DUMAVA_MAX_INVESTERING = 1_500_000;
const SUBSIDIE_PCT = 0.3;
const FEE_PCT = 10;

const ORG_OPTIES = [
  { value: "zorg", label: "Zorginstelling", icon: "🏥" },
  { value: "onderwijs", label: "Onderwijs", icon: "🎓" },
  { value: "sport", label: "Sport", icon: "⚽" },
  { value: "gemeente", label: "Gemeente / overheid", icon: "🏛" },
  { value: "overig_maatschappelijk", label: "Overig maatschappelijk", icon: "🏢" },
];

const MAATREGEL_TILES = [
  { key: "warmtepomp", label: "Warmtepomp", erkend: true },
  { key: "zonnepanelen", label: "Zonnepanelen", erkend: true },
  { key: "dakisolatie", label: "Dakisolatie", erkend: true },
  { key: "gevelisolatie", label: "Gevelisolatie", erkend: true },
  { key: "led_verlichting", label: "LED verlichting", erkend: false },
  { key: "warmtenet", label: "Warmtenet aansluiting", erkend: false },
  { key: "vloerisolatie", label: "Vloerisolatie", erkend: true },
  { key: "overig", label: "Overige maatregel", erkend: false },
];

const ERKENDE_KEYS = new Set(
  MAATREGEL_TILES.filter((t) => t.erkend).map((t) => t.key),
);

function emptyDetails() {
  return Object.fromEntries(
    MAATREGEL_TILES.map((t) => [
      t.key,
      { beschrijving: "", investering: "" },
    ]),
  );
}

function parseEuroInput(raw) {
  if (raw === "" || raw == null) return null;
  const n = Number(String(raw).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default function DumavaAanvraagWizard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [phase, setPhase] = useState(1);
  const [orgType, setOrgType] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [details, setDetails] = useState(emptyDetails);
  const [gebouw, setGebouw] = useState({
    oppervlakte_m2: "",
    bouwjaar: "",
    energielabel_huidig: "",
    heeft_maatwerkadvies: false,
  });
  const [contact, setContact] = useState({
    contactpersoon_naam: "",
    contact_functie: "",
    telefoon: "",
    rvo_contact_gehad: false,
  });
  const [submitErr, setSubmitErr] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);

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

  useEffect(() => {
    if (!project) return;
    setGebouw((prev) => ({
      ...prev,
      bouwjaar:
        prev.bouwjaar === "" && project.bouwjaar != null
          ? String(project.bouwjaar)
          : prev.bouwjaar,
      oppervlakte_m2:
        prev.oppervlakte_m2 === "" && project.oppervlakte_m2 != null
          ? String(project.oppervlakte_m2)
          : prev.oppervlakte_m2,
      energielabel_huidig:
        prev.energielabel_huidig === "" && project.energielabel_huidig
          ? project.energielabel_huidig
          : prev.energielabel_huidig,
    }));
  }, [project]);

  const adresLabel = project
    ? `${project.straat} ${project.huisnummer}, ${project.postcode} ${project.plaats}`
    : "…";

  const totaalInvestering = useMemo(() => {
    let sum = 0;
    for (const key of selectedKeys) {
      const n = parseEuroInput(details[key]?.investering);
      if (n != null) sum += n;
    }
    return sum;
  }, [selectedKeys, details]);

  const subsidieDisplay = useMemo(() => {
    const capBase = Math.min(totaalInvestering, DUMAVA_MAX_INVESTERING);
    return Math.round(capBase * SUBSIDIE_PCT * 100) / 100;
  }, [totaalInvestering]);

  const feeBedrag =
    subsidieDisplay > 0
      ? Math.round(subsidieDisplay * (FEE_PCT / 100) * 100) / 100
      : 0;
  const nettoBedrag =
    subsidieDisplay > 0
      ? Math.round((subsidieDisplay - feeBedrag) * 100) / 100
      : 0;

  function toggleMaatregel(key) {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function setDetail(key, field, value) {
    setDetails((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  function goBack() {
    setSubmitErr(null);
    if (phase === "done") return;
    if (phase > 1) setPhase(phase - 1);
    else navigate(`/projecten/${projectId}`);
  }

  function validateStep1() {
    if (!orgType) {
      alert("Kies het type organisatie.");
      return false;
    }
    return true;
  }

  function validateStep2() {
    if (selectedKeys.length < 2) {
      alert("Selecteer minimaal 2 maatregelen.");
      return false;
    }
    const hasErkend = selectedKeys.some((k) => ERKENDE_KEYS.has(k));
    if (!hasErkend) {
      alert(
        "DUMAVA vereist minimaal 1 erkende maatregel (bijv. warmtepomp, zonnepanelen of isolatie).",
      );
      return false;
    }
    for (const key of selectedKeys) {
      const lab =
        MAATREGEL_TILES.find((t) => t.key === key)?.label ?? key;
      const d = details[key];
      if (!d?.beschrijving?.trim()) {
        alert(`Vul een beschrijving in bij: ${lab}.`);
        return false;
      }
      const n = parseEuroInput(d?.investering);
      if (n == null) {
        alert(`Vul een geldige investering in bij: ${lab}.`);
        return false;
      }
    }
    return true;
  }

  function validateStep3() {
    const op = Number(String(gebouw.oppervlakte_m2).replace(",", "."));
    if (!Number.isFinite(op) || op <= 0) {
      alert("Vul de oppervlakte van het gebouw in (m²).");
      return false;
    }
    const bj = parseInt(String(gebouw.bouwjaar), 10);
    if (!Number.isFinite(bj) || bj < 1500 || bj > 2100) {
      alert("Vul een geldig bouwjaar in.");
      return false;
    }
    return true;
  }

  function validateStep5() {
    if (!contact.contactpersoon_naam.trim()) {
      alert("Vul de naam van de contactpersoon in.");
      return false;
    }
    if (!contact.telefoon.trim() || contact.telefoon.trim().length < 6) {
      alert("Vul een geldig telefoonnummer in.");
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validateStep5()) return;
    setSubmitErr(null);
    setSubmitting(true);
    try {
      const items = selectedKeys.map((key) => ({
        maatregel_key: key,
        beschrijving: details[key].beschrijving.trim(),
        investering_bedrag: parseEuroInput(details[key].investering),
      }));
      const body = {
        organisatie_type: orgType,
        items,
        oppervlakte_m2: Number(
          String(gebouw.oppervlakte_m2).replace(",", "."),
        ),
        bouwjaar: parseInt(String(gebouw.bouwjaar), 10),
        energielabel_huidig: gebouw.energielabel_huidig || null,
        heeft_maatwerkadvies: gebouw.heeft_maatwerkadvies,
        contactpersoon_naam: contact.contactpersoon_naam.trim(),
        contact_functie: contact.contact_functie.trim() || null,
        telefoon: contact.telefoon.trim(),
        rvo_contact_gehad: contact.rvo_contact_gehad,
      };
      const list = await submitDumavaAanvraag(projectId, body);
      setCreated(list);
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

  const progressPhase = phase === "done" ? 5 : phase;

  return (
    <div className="container-app py-8 sm:py-10">
      <PageMeta title="DUMAVA aanvraag" />

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
        <span className="font-semibold text-gray-800">DUMAVA</span>
      </nav>

      {phase !== "done" && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
            <span>Stap {progressPhase} van 5</span>
            <span>{Math.round((progressPhase / 5) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand-green transition-all duration-300"
              style={{ width: `${(progressPhase / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-8">
        {phase === 1 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              Wat voor organisatie bent u?
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ORG_OPTIES.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setOrgType(o.value)}
                  className={`flex min-h-[88px] flex-col rounded-2xl border-2 p-4 text-left text-sm font-semibold transition-all ${
                    orgType === o.value
                      ? "border-brand-green bg-brand-greenLight/40 text-gray-900"
                      : "border-gray-200 bg-white text-gray-800 hover:border-brand-green/50"
                  }`}
                >
                  <span className="text-2xl">{o.icon}</span>
                  <span className="mt-2">{o.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-brand-green/30 bg-brand-greenLight/50 p-4 text-sm text-gray-800">
              DUMAVA is beschikbaar voor organisaties met maatschappelijk vastgoed.
              Het budget voor 2026 is €405 miljoen. AAA-Lex helpt u de aanvraag
              op tijd in te dienen.
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
              Welke verduurzamingsmaatregelen?
            </h2>
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-950">
              DUMAVA vereist minimaal 2 maatregelen, waarvan minimaal 1 erkende
              maatregel.
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {MAATREGEL_TILES.map((t) => {
                const sel = selectedKeys.includes(t.key);
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => toggleMaatregel(t.key)}
                    className={`rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all ${
                      sel
                        ? "border-brand-green bg-brand-greenLight/50 text-gray-900"
                        : "border-gray-200 text-gray-800 hover:border-gray-300"
                    }`}
                  >
                    {t.label}
                    {t.erkend ? (
                      <span className="mt-1 block text-xs font-normal text-gray-600">
                        Erkend
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {selectedKeys.length > 0 && (
              <div className="mt-8 space-y-6">
                {selectedKeys.map((key) => {
                  const meta = MAATREGEL_TILES.find((x) => x.key === key);
                  const d = details[key];
                  return (
                    <div
                      key={key}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <h3 className="text-sm font-extrabold text-gray-900">
                        {meta?.label}
                      </h3>
                      <label className="mt-3 block text-xs font-semibold text-gray-700">
                        Beschrijving *
                        <textarea
                          rows={2}
                          className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                          value={d?.beschrijving ?? ""}
                          onChange={(e) =>
                            setDetail(key, "beschrijving", e.target.value)
                          }
                          placeholder="Korte omschrijving van deze maatregel"
                        />
                      </label>
                      <label className="mt-3 block text-xs font-semibold text-gray-700">
                        Geschatte investering (€) *
                        <input
                          type="text"
                          inputMode="decimal"
                          className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                          value={d?.investering ?? ""}
                          onChange={(e) =>
                            setDetail(key, "investering", e.target.value)
                          }
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
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
              Details over uw gebouw
            </h2>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Oppervlakte gebouw m² *
              <input
                type="text"
                inputMode="decimal"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                value={gebouw.oppervlakte_m2}
                onChange={(e) =>
                  setGebouw((g) => ({ ...g, oppervlakte_m2: e.target.value }))
                }
              />
            </label>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Bouwjaar *
              <input
                type="number"
                min={1500}
                max={2100}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                value={gebouw.bouwjaar}
                onChange={(e) =>
                  setGebouw((g) => ({ ...g, bouwjaar: e.target.value }))
                }
              />
            </label>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Huidig energielabel
              <select
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                value={gebouw.energielabel_huidig}
                onChange={(e) =>
                  setGebouw((g) => ({
                    ...g,
                    energielabel_huidig: e.target.value,
                  }))
                }
              >
                <option value="">— niet bekend —</option>
                {ENERGIELABELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-gray-800">
                Heeft u al een maatwerkadvies?
              </legend>
              <p className="mt-1 text-xs text-gray-600">
                DUMAVA vereist een EPA-maatwerkadvies. AAA-Lex kan dit voor u
                verzorgen als onderdeel van het traject.
              </p>
              <div className="mt-2 flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="maatwerkadvies"
                    checked={!gebouw.heeft_maatwerkadvies}
                    onChange={() =>
                      setGebouw((g) => ({ ...g, heeft_maatwerkadvies: false }))
                    }
                  />
                  Nee
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="maatwerkadvies"
                    checked={gebouw.heeft_maatwerkadvies}
                    onChange={() =>
                      setGebouw((g) => ({ ...g, heeft_maatwerkadvies: true }))
                    }
                  />
                  Ja
                </label>
              </div>
            </fieldset>
            <button
              type="button"
              className="btn-primary mt-8 px-8 py-3"
              onClick={() => {
                if (validateStep3()) setPhase(4);
              }}
            >
              Volgende
            </button>
          </section>
        )}

        {phase === 4 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              Financieel overzicht
            </h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                <dt className="text-gray-600">Totale investering alle maatregelen</dt>
                <dd className="font-bold text-gray-900">
                  {formatEuro(totaalInvestering)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                <dt className="text-gray-600">Geschatte DUMAVA subsidie (30%)</dt>
                <dd className="font-bold text-gray-900">
                  ± {formatEuro(subsidieDisplay)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                <dt className="text-gray-600">Maximum per gebouw (investering)</dt>
                <dd className="font-semibold text-gray-800">
                  {formatEuro(DUMAVA_MAX_INVESTERING)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-gray-100 pb-2">
                <dt className="text-gray-600">AAA-Lex fee ({FEE_PCT}%)</dt>
                <dd className="font-bold text-gray-900">
                  {formatEuro(feeBedrag)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 pt-1">
                <dt className="text-gray-600">U ontvangt netto (indicatie)</dt>
                <dd className="font-bold text-brand-greenDark">
                  ± {formatEuro(nettoBedrag)}
                </dd>
              </div>
            </dl>
            {totaalInvestering > DUMAVA_MAX_INVESTERING && (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
                Let op: uw totale investering overschrijdt het indicatieve plafond
                van €1.500.000 per gebouw. De werkelijke subsidiabele kosten
                bepaalt RVO.
              </p>
            )}
            <div className="mt-6 rounded-xl border border-brand-green/30 bg-brand-greenLight/50 p-4 text-sm text-gray-800">
              DUMAVA subsidie wordt aangevraagd bij RVO. Het budget is gelimiteerd
              — tijdig aanvragen is essentieel. AAA-Lex bewaakt de openstellingsperiodes
              voor u.
            </div>
            <button
              type="button"
              className="btn-primary mt-8 px-8 py-3"
              onClick={() => setPhase(5)}
            >
              Volgende
            </button>
          </section>
        )}

        {phase === 5 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              Uw contactgegevens
            </h2>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Naam contactpersoon *
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                value={contact.contactpersoon_naam}
                onChange={(e) =>
                  setContact((c) => ({
                    ...c,
                    contactpersoon_naam: e.target.value,
                  }))
                }
              />
            </label>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Functie
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                value={contact.contact_functie}
                onChange={(e) =>
                  setContact((c) => ({ ...c, contact_functie: e.target.value }))
                }
              />
            </label>
            <label className="mt-6 block text-sm font-semibold text-gray-800">
              Telefoonnummer *
              <input
                type="tel"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none ring-brand-green focus:border-brand-green focus:ring-2"
                value={contact.telefoon}
                onChange={(e) =>
                  setContact((c) => ({ ...c, telefoon: e.target.value }))
                }
              />
            </label>
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-gray-800">
                Heeft u al contact gehad met RVO over dit project?
              </legend>
              <div className="mt-2 flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="rvo"
                    checked={!contact.rvo_contact_gehad}
                    onChange={() =>
                      setContact((c) => ({ ...c, rvo_contact_gehad: false }))
                    }
                  />
                  Nee
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="rvo"
                    checked={contact.rvo_contact_gehad}
                    onChange={() =>
                      setContact((c) => ({ ...c, rvo_contact_gehad: true }))
                    }
                  />
                  Ja
                </label>
              </div>
            </fieldset>
            {submitErr && (
              <p className="mt-4 text-sm font-semibold text-red-700">{submitErr}</p>
            )}
            <button
              type="button"
              className="btn-primary mt-8 px-8 py-3 disabled:opacity-60"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Bezig…" : "Aanvraag indienen"}
            </button>
          </section>
        )}

        {phase === "done" && created?.length > 0 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              Aanvraag ingediend bij AAA-Lex
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-gray-700">
              DUMAVA aanvragen zijn complex en vereisen intensieve begeleiding.
              AAA-Lex neemt binnen 1 werkdag contact met u op voor een
              intakegesprek.
            </p>
            <p className="mt-3 text-sm text-gray-600">
              Er zijn {created.length} maatregel-dossiers aangemaakt op dit project.
            </p>
            <Link
              to={`/projecten/${projectId}/maatregelen/${created[0].id}`}
              className="btn-primary mt-8 inline-flex px-8 py-3"
            >
              Naar eerste dossier
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
