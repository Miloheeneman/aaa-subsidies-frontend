import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import PageMeta from "../../components/PageMeta.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import { formatDate, formatEuro } from "../../lib/formatters.js";
import {
  getProject,
  maatregelLabel,
  submitIsdeWarmtepompAanvraag,
} from "../../lib/projecten.js";

const WARMTEPOMP_OPTIES = [
  {
    value: "warmtepomp_lucht_water",
    titel: "Lucht/water warmtepomp",
    subsidie: 2500,
    subtekst:
      "Haalt warmte uit de buitenlucht en geeft die aan het water in uw verwarmingssysteem.",
  },
  {
    value: "warmtepomp_water_water",
    titel: "Water/water warmtepomp",
    subsidie: 3500,
    subtekst:
      "Gebruikt energie uit grondwater of bodemwarmte — zeer efficiënt bij de juiste bodem.",
  },
  {
    value: "warmtepomp_hybride",
    titel: "Hybride warmtepomp",
    subsidie: 1500,
    subtekst:
      "Combineert een warmtepomp met uw bestaande ketel voor een geleidelijke overstap.",
  },
];

const FEE_PCT = 8;

function estimateWarmtepompSubsidie(maatregelType) {
  const row = WARMTEPOMP_OPTIES.find((o) => o.value === maatregelType);
  return row ? row.subsidie : null;
}

function deadlineNaInstallatie(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth() + 24);
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const initialForm = {
  situatie: null,
  warmtepomp_subtype: null,
  apparaat_merk: "",
  apparaat_typenummer: "",
  apparaat_meldcode: "",
  installateur_naam: "",
  installateur_kvk: "",
  installateur_gecertificeerd: false,
  installatie_datum: "",
  investering_bedrag: "",
  heeft_offerte: false,
  offerte_datum: "",
};

export default function IsdeWarmtepompAanvraagWizard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [phase, setPhase] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [showMeldcodeInfo, setShowMeldcodeInfo] = useState(false);
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

  const progressStep = useMemo(() => {
    if (phase === "orient_info") return 1;
    if (typeof phase === "number") return phase;
    return 5;
  }, [phase]);

  const adresLabel = project
    ? `${project.straat} ${project.huisnummer}, ${project.postcode} ${project.plaats}`
    : "…";

  function setF(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function goBack() {
    setSubmitErr(null);
    if (phase === "done") return;
    if (phase === 5) setPhase(4);
    else if (phase === 4) setPhase(3);
    else if (phase === 3) setPhase(2);
    else if (phase === 2) {
      if (form.situatie === "orienteren") setPhase("orient_info");
      else setPhase(1);
    } else if (phase === "orient_info") setPhase(1);
    else navigate(`/projecten/${projectId}`);
  }

  const geschatteSubsidie = estimateWarmtepompSubsidie(form.warmtepomp_subtype);
  const feeBedrag =
    geschatteSubsidie != null ? Math.round(geschatteSubsidie * (FEE_PCT / 100) * 100) / 100 : null;
  const nettoBedrag =
    geschatteSubsidie != null && feeBedrag != null
      ? Math.round((geschatteSubsidie - feeBedrag) * 100) / 100
      : null;

  async function handleSubmit() {
    setSubmitErr(null);
    setSubmitting(true);
    try {
      const body = {
        situatie: form.situatie,
        warmtepomp_subtype: form.warmtepomp_subtype,
        apparaat_merk: form.apparaat_merk.trim() || null,
        apparaat_typenummer: form.apparaat_typenummer.trim() || null,
        apparaat_meldcode: form.apparaat_meldcode.trim() || null,
        installateur_naam: form.installateur_naam.trim(),
        installateur_kvk: form.installateur_kvk.trim() || null,
        installateur_gecertificeerd: form.installateur_gecertificeerd,
        installatie_datum: form.installatie_datum || null,
        investering_bedrag: form.investering_bedrag
          ? Number(String(form.investering_bedrag).replace(",", "."))
          : null,
        heeft_offerte: form.heeft_offerte,
        offerte_datum:
          form.heeft_offerte && form.offerte_datum ? form.offerte_datum : null,
      };
      const m = await submitIsdeWarmtepompAanvraag(projectId, body);
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
      <PageMeta title="ISDE warmtepomp aanvraag" />

      <nav className="text-xs text-gray-500 sm:text-sm">
        <Link to="/projecten" className="font-semibold text-brand-green hover:underline">
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
        <span className="font-semibold text-gray-800">
          ISDE Warmtepomp aanvraag
        </span>
      </nav>

      {phase !== "done" && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
            <span>
              Stap {progressStep} van 5
            </span>
            <span>{Math.round((progressStep / 5) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand-green transition-all duration-300"
              style={{ width: `${(progressStep / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-8">
        {phase === 1 && (
          <Step1Situatie
            form={form}
            onNext={(choice) => {
              setF("situatie", choice);
              if (choice === "geinstalleerd") setPhase(2);
              else setPhase("orient_info");
            }}
          />
        )}

        {phase === "orient_info" && (
          <StepOrientInfo onContinue={() => setPhase(2)} />
        )}

        {phase === 2 && (
          <Step2Details
            form={form}
            setF={setF}
            showMeldcodeInfo={showMeldcodeInfo}
            setShowMeldcodeInfo={setShowMeldcodeInfo}
            onNext={() => {
              if (!form.warmtepomp_subtype) {
                alert("Kies een type warmtepomp.");
                return;
              }
              setPhase(3);
            }}
          />
        )}

        {phase === 3 && (
          <Step3Installateur
            form={form}
            setF={setF}
            onNext={() => {
              if (!form.installateur_naam.trim()) {
                alert("Vul de naam van het installatiebedrijf in.");
                return;
              }
              setPhase(4);
            }}
          />
        )}

        {phase === 4 && (
          <Step4Financieel
            form={form}
            setF={setF}
            geschatteSubsidie={geschatteSubsidie}
            feeBedrag={feeBedrag}
            nettoBedrag={nettoBedrag}
            onNext={() => setPhase(5)}
          />
        )}

        {phase === 5 && (
          <Step5Confirm
            form={form}
            geschatteSubsidie={geschatteSubsidie}
            deadlineLabel={deadlineNaInstallatie(form.installatie_datum)}
            submitErr={submitErr}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        )}

        {phase === "done" && created && (
          <StepDone
            form={form}
            maatregel={created}
            projectId={projectId}
          />
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

function Tile({ selected, onClick, icon, title, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col rounded-2xl border-2 p-6 text-left transition-all duration-200 sm:min-h-[140px] ${
        selected
          ? "border-brand-green bg-brand-greenLight shadow-md ring-2 ring-brand-green/20"
          : "border-gray-200 bg-white hover:border-brand-green/50 hover:shadow-sm"
      }`}
    >
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>
      <span className="mt-3 text-lg font-extrabold text-gray-900">{title}</span>
      <span className="mt-2 text-sm text-gray-600">{sub}</span>
    </button>
  );
}

function Step1Situatie({ form, onNext }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Heeft u al een warmtepomp?
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Zo weten wij hoe we u het beste kunnen begeleiden voor uw ISDE-aanvraag.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Tile
          selected={form.situatie === "geinstalleerd"}
          onClick={() => onNext("geinstalleerd")}
          icon="✓"
          title="Ja, al geïnstalleerd"
          sub="De warmtepomp is al geplaatst"
        />
        <Tile
          selected={form.situatie === "orienteren"}
          onClick={() => onNext("orienteren")}
          icon="📅"
          title="Nog niet, ik ben aan het oriënteren"
          sub="Ik overweeg een warmtepomp"
        />
      </div>
    </div>
  );
}

function StepOrientInfo({ onContinue }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-brand-green/30 bg-brand-greenLight p-8">
      <h1 className="text-xl font-extrabold text-brand-greenDark sm:text-2xl">
        Goed nieuws — u kunt al subsidie aanvragen vóórdat de warmtepomp
        geïnstalleerd wordt.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-gray-700">
        AAA-Lex regelt dit voor u. Vul alvast de gegevens in zodat wij u
        kunnen begeleiden.
      </p>
      <button type="button" onClick={onContinue} className="btn-primary mt-8">
        Toch verder →
      </button>
    </div>
  );
}

function Step2Details({
  form,
  setF,
  showMeldcodeInfo,
  setShowMeldcodeInfo,
  onNext,
}) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Welk type warmtepomp?
      </h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {WARMTEPOMP_OPTIES.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setF("warmtepomp_subtype", o.value)}
            className={`flex flex-col rounded-xl border-2 p-4 text-left transition-all duration-200 ${
              form.warmtepomp_subtype === o.value
                ? "border-brand-green bg-brand-greenLight shadow-md"
                : "border-gray-200 bg-white hover:border-brand-green/40"
            }`}
          >
            <span className="text-sm font-extrabold text-gray-900">
              {o.titel}
            </span>
            <span className="mt-1 text-xs font-bold text-brand-green">
              ± {formatEuro(o.subsidie)} subsidie
            </span>
            <span className="mt-2 text-xs leading-relaxed text-gray-600">
              {o.subtekst}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 inline-block font-semibold text-gray-800">
            Merk warmtepomp{" "}
            <span className="font-normal text-gray-400">(optioneel)</span>
          </span>
          <input
            className="input"
            value={form.apparaat_merk}
            onChange={(e) => setF("apparaat_merk", e.target.value)}
            placeholder="bijv. Daikin"
          />
          <span className="mt-1 block text-xs text-gray-500">
            Staat op de factuur of het apparaat
          </span>
        </label>
        <label className="block text-sm">
          <span className="mb-1 inline-block font-semibold text-gray-800">
            Typenummer{" "}
            <span className="font-normal text-gray-400">(optioneel)</span>
          </span>
          <input
            className="input"
            value={form.apparaat_typenummer}
            onChange={(e) => setF("apparaat_typenummer", e.target.value)}
          />
          <span className="mt-1 block text-xs text-gray-500">
            Staat op de factuur
          </span>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 inline-block font-semibold text-gray-800">
            Meldcode{" "}
            <span className="font-normal text-gray-400">(optioneel)</span>
          </span>
          <input
            className="input"
            value={form.apparaat_meldcode}
            onChange={(e) => setF("apparaat_meldcode", e.target.value)}
          />
          <span className="mt-1 block text-xs text-gray-500">
            Staat op de factuur — vraag uw installateur om dit erop te zetten
          </span>
          <div className="relative mt-2">
            <button
              type="button"
              className="text-xs font-semibold text-brand-green hover:underline"
              onClick={() => setShowMeldcodeInfo((v) => !v)}
              aria-expanded={showMeldcodeInfo}
            >
              Wat is een meldcode? →
            </button>
            {showMeldcodeInfo && (
              <div
                role="tooltip"
                className="absolute left-0 top-full z-10 mt-2 max-w-md rounded-lg border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-700 shadow-lg"
              >
                De meldcode is een unieke code die bij uw specifieke
                installatie hoort. RVO gebruikt deze om uw apparaat te
                koppelen aan de subsidieaanvraag. Zonder meldcode kan de
                aanvraag niet worden afgerond — uw installateur kan de
                code op de factuur vermelden.
              </div>
            )}
          </div>
        </label>
      </div>

      <div className="mt-10 flex justify-end">
        <button type="button" onClick={onNext} className="btn-primary">
          Volgende stap
        </button>
      </div>
    </div>
  );
}

function Step3Installateur({ form, setF, onNext }) {
  const deadline = deadlineNaInstallatie(form.installatie_datum);
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Wie installeert de warmtepomp?
      </h1>
      <div className="mt-8 max-w-xl space-y-6">
        <label className="block text-sm">
          <span className="mb-1 inline-block font-semibold text-gray-800">
            Naam installatiebedrijf <span className="text-red-600">*</span>
          </span>
          <input
            className="input"
            value={form.installateur_naam}
            onChange={(e) => setF("installateur_naam", e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 inline-block font-semibold text-gray-800">
            KvK-nummer{" "}
            <span className="font-normal text-gray-400">(optioneel)</span>
          </span>
          <input
            className="input"
            value={form.installateur_kvk}
            onChange={(e) => setF("installateur_kvk", e.target.value)}
          />
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
            checked={form.installateur_gecertificeerd}
            onChange={(e) =>
              setF("installateur_gecertificeerd", e.target.checked)
            }
          />
          <span>
            <span className="font-semibold text-gray-800">
              Is het bedrijf gecertificeerd?
            </span>
            <span className="mt-1 block text-xs text-gray-500">
              Een gecertificeerd bouwinstallatiebedrijf is vereist voor ISDE
              subsidie
            </span>
          </span>
        </label>
        <label className="block text-sm">
          <span className="mb-1 inline-block font-semibold text-gray-800">
            Installatiedatum{" "}
            <span className="font-normal text-gray-400">(optioneel)</span>
          </span>
          <input
            type="date"
            className="input"
            value={form.installatie_datum}
            onChange={(e) => setF("installatie_datum", e.target.value)}
          />
          <span className="mt-1 block text-xs text-gray-500">
            Als de warmtepomp al geïnstalleerd is
          </span>
          {deadline && (
            <p className="mt-3 rounded-md border border-brand-green/30 bg-brand-greenLight px-3 py-2 text-sm font-semibold text-brand-greenDark">
              Deadline aanvragen: {deadline}
            </p>
          )}
        </label>
      </div>
      <div className="mt-10 flex justify-end">
        <button type="button" onClick={onNext} className="btn-primary">
          Volgende stap
        </button>
      </div>
    </div>
  );
}

function Step4Financieel({
  form,
  setF,
  geschatteSubsidie,
  feeBedrag,
  nettoBedrag,
  onNext,
}) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Wat zijn de kosten?
      </h1>
      <div className="mt-8 max-w-xl space-y-6">
        <label className="block text-sm">
          <span className="mb-1 inline-block font-semibold text-gray-800">
            Geschatte investering{" "}
            <span className="font-normal text-gray-400">(optioneel)</span>
          </span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              €
            </span>
            <input
              type="text"
              inputMode="decimal"
              className="input pl-8"
              value={form.investering_bedrag}
              onChange={(e) => setF("investering_bedrag", e.target.value)}
              placeholder="0"
            />
          </div>
          <span className="mt-1 block text-xs text-gray-500">
            Inclusief installatie en materialen
          </span>
        </label>

        <div className="text-sm">
          <span className="font-semibold text-gray-800">
            Heeft u al een offerte?
          </span>
          <div className="mt-2 inline-flex rounded-lg border border-gray-200 p-1">
            <button
              type="button"
              onClick={() => setF("heeft_offerte", false)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                !form.heeft_offerte
                  ? "bg-brand-green text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Nee
            </button>
            <button
              type="button"
              onClick={() => setF("heeft_offerte", true)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                form.heeft_offerte
                  ? "bg-brand-green text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Ja
            </button>
          </div>
        </div>

        {form.heeft_offerte && (
          <label className="block text-sm">
            <span className="mb-1 inline-block font-semibold text-gray-800">
              Offertedatum
            </span>
            <input
              type="date"
              className="input"
              value={form.offerte_datum}
              onChange={(e) => setF("offerte_datum", e.target.value)}
            />
          </label>
        )}
      </div>

      <div className="mt-8 max-w-xl rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-gray-600">Geschatte subsidie</span>
          <span className="font-bold text-gray-900">
            {geschatteSubsidie != null
              ? `± ${formatEuro(geschatteSubsidie)}`
              : "—"}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-600">AAA-Lex fee ({FEE_PCT}%)</span>
          <span className="font-semibold text-gray-800">
            {feeBedrag != null ? formatEuro(feeBedrag) : "—"}
          </span>
        </div>
        <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-extrabold text-brand-green">
          <span>U ontvangt netto</span>
          <span>
            {nettoBedrag != null ? `± ${formatEuro(nettoBedrag)}` : "—"}
          </span>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          Schatting op basis van officiële RVO tarieven. Definitief bedrag
          na RVO beoordeling.
        </p>
      </div>

      <div className="mt-10 flex justify-end">
        <button type="button" onClick={onNext} className="btn-primary">
          Volgende stap
        </button>
      </div>
    </div>
  );
}

function Step5Confirm({
  form,
  geschatteSubsidie,
  deadlineLabel,
  submitErr,
  submitting,
  onSubmit,
}) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Bevestig uw aanvraag
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Controleer uw gegevens en dien in — daarna nemen wij uw dossier in
        behandeling.
      </p>
      <ul className="mt-6 max-w-xl space-y-2 rounded-xl border border-gray-100 bg-white p-5 text-sm shadow-sm">
        <li className="flex justify-between gap-4">
          <span className="text-gray-500">Situatie</span>
          <span className="font-semibold text-gray-900">
            {form.situatie === "geinstalleerd"
              ? "Al geïnstalleerd"
              : "Oriëntatie"}
          </span>
        </li>
        <li className="flex justify-between gap-4">
          <span className="text-gray-500">Type</span>
          <span className="font-semibold text-gray-900">
            {maatregelLabel(form.warmtepomp_subtype)}
          </span>
        </li>
        <li className="flex justify-between gap-4">
          <span className="text-gray-500">Installateur</span>
          <span className="font-semibold text-gray-900">
            {form.installateur_naam}
          </span>
        </li>
        <li className="flex justify-between gap-4">
          <span className="text-gray-500">Geschatte subsidie</span>
          <span className="font-semibold text-brand-green">
            {geschatteSubsidie != null
              ? `± ${formatEuro(geschatteSubsidie)}`
              : "—"}
          </span>
        </li>
        <li className="flex justify-between gap-4">
          <span className="text-gray-500">Deadline (indicatie)</span>
          <span className="font-semibold text-gray-900">
            {deadlineLabel || "—"}
          </span>
        </li>
      </ul>
      {submitErr && (
        <div className="mt-4 max-w-xl rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {submitErr}
        </div>
      )}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="btn-primary"
        >
          {submitting ? "Bezig…" : "Aanvraag indienen bij AAA-Lex"}
        </button>
      </div>
    </div>
  );
}

function StepDone({ form, maatregel, projectId }) {
  const deadline =
    maatregel.deadline_indienen != null
      ? formatDate(maatregel.deadline_indienen)
      : "—";

  return (
    <div className="mx-auto max-w-lg text-center">
      <div
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-greenLight wizard-check-pop"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 48 48"
          className="h-14 w-14 text-brand-green"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 24l9 9 15-18" />
        </svg>
      </div>
      <h1 className="mt-8 text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Uw aanvraag is ingediend bij AAA-Lex
      </h1>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 text-left text-sm shadow-sm">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-gray-500">
          Overzicht
        </h2>
        <dl className="mt-3 space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Type warmtepomp</dt>
            <dd className="font-semibold text-gray-900">
              {maatregelLabel(form.warmtepomp_subtype)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Installateur</dt>
            <dd className="font-semibold text-gray-900">
              {form.installateur_naam}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Geschatte subsidie</dt>
            <dd className="font-semibold text-brand-green">
              {maatregel.geschatte_subsidie != null
                ? formatEuro(maatregel.geschatte_subsidie)
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Deadline</dt>
            <dd className="font-semibold text-gray-900">{deadline}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-gray-700">
        AAA-Lex neemt uw aanvraag in behandeling. Wij nemen binnen 2
        werkdagen contact met u op om de volgende stappen te bespreken.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/projecten" className="btn-secondary sm:!px-8">
          Terug naar projectoverzicht
        </Link>
        <Link to={`/projecten/${projectId}`} className="btn-primary sm:!px-8">
          Nog een maatregel toevoegen
        </Link>
      </div>
    </div>
  );
}
