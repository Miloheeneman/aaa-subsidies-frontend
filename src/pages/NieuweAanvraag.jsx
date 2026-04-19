import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { RegelingBadge } from "../components/StatusBadge.jsx";
import { api, apiErrorMessage } from "../lib/api.js";
import {
  formatEuro,
  maatregelLabel,
  regelingLabel,
  typeAanvragerLabel,
} from "../lib/formatters.js";
import SelectableCard from "./subsidiecheck/SelectableCard.jsx";

const REGELING_CARDS = [
  {
    id: "ISDE",
    title: "ISDE",
    description:
      "Particulieren en zakelijke verhuurders. Warmtepomp / isolatie. Fee ~8%.",
  },
  {
    id: "EIA",
    title: "EIA",
    description:
      "Ondernemers (IB/VPB). 45,5% fiscaal voordeel. Min. €2.500. Fee ~5%.",
  },
  {
    id: "MIA",
    title: "MIA + Vamil",
    description:
      "Ondernemers. Fiscaal voordeel (27-45%) + willekeurig afschrijven. Fee ~5%.",
    impliesVamil: true,
  },
  {
    id: "DUMAVA",
    title: "DUMAVA",
    description:
      "Maatschappelijk vastgoed. Tot 30% subsidie. Aanvragen vóór start uitvoering. Fee ~10%.",
  },
];

const TYPE_AANVRAGER_DEFAULTS = {
  ISDE: "particulier",
  EIA: "ondernemer",
  MIA: "ondernemer",
  VAMIL: "ondernemer",
  DUMAVA: "maatschappelijk",
};

const TYPE_AANVRAGER_OPTIONS = [
  "particulier",
  "zakelijk",
  "vve",
  "maatschappelijk",
  "ondernemer",
];

const MAATREGEL_OPTIONS = [
  { id: "warmtepomp", label: "Warmtepomp" },
  { id: "isolatie", label: "Isolatie (dak/gevel/vloer/glas)" },
  { id: "energiesysteem", label: "Energiezuinig systeem" },
  { id: "meerdere", label: "Meerdere / nog onbekend" },
];

const REQUIRED_DOCS = {
  ISDE: [
    "Offerte",
    "Factuur",
    "Betalingsbewijs",
    "Foto installatie",
    "Werkbon (gecertificeerde installateur)",
    "Energielabel",
  ],
  EIA: [
    "Ondertekende offerte",
    "KvK uittreksel",
    "Technische specificaties",
    "Energielijst referentie (RVO)",
  ],
  MIA: [
    "Ondertekende offerte",
    "KvK uittreksel",
    "Technische specificaties",
    "Milieulijst referentie (RVO)",
  ],
  VAMIL: [
    "Ondertekende offerte",
    "KvK uittreksel",
    "Technische specificaties",
    "Milieulijst referentie (RVO)",
  ],
  DUMAVA: [
    "Maatwerkadvies of energie-audit",
    "Offertes",
    "Begroting",
    "Foto voor aanvang",
    "Facturen",
    "Foto na oplevering",
  ],
};

function StepIndicator({ step }) {
  const steps = [
    { id: 1, label: "Regeling" },
    { id: 2, label: "Details" },
    { id: 3, label: "Bevestiging" },
  ];
  return (
    <ol className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full ${
              step >= s.id
                ? "bg-brand-green text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {s.id}
          </span>
          <span
            className={step >= s.id ? "text-brand-green" : "text-gray-500"}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span className="mx-2 h-px w-8 bg-gray-300" aria-hidden />
          )}
        </li>
      ))}
    </ol>
  );
}

export default function NieuweAanvraag() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [regeling, setRegeling] = useState(null);
  const [details, setDetails] = useState({
    type_aanvrager: "particulier",
    maatregel: "warmtepomp",
    investering_bedrag: "",
    offerte_beschikbaar: false,
    gewenste_startdatum: "",
  });

  useEffect(() => {
    // Prefill reasonable defaults per regeling.
    if (regeling && TYPE_AANVRAGER_DEFAULTS[regeling]) {
      setDetails((d) => ({
        ...d,
        type_aanvrager: TYPE_AANVRAGER_DEFAULTS[regeling],
      }));
    }
  }, [regeling]);

  const effectiveRegelingen = useMemo(() => {
    if (regeling === "MIA") return ["MIA", "VAMIL"];
    return regeling ? [regeling] : [];
  }, [regeling]);

  const deadlineText = useMemo(() => {
    if (!regeling) return null;
    if (["EIA", "MIA"].includes(regeling)) {
      return "EIA/MIA/Vamil: aanvragen binnen 3 maanden na ondertekening offerte.";
    }
    if (regeling === "DUMAVA") {
      return "DUMAVA: aanvragen moet vóór start uitvoering. Realisatie binnen 2 jaar.";
    }
    return null;
  }, [regeling]);

  const canContinue1 = Boolean(regeling);
  const canContinue2 =
    Boolean(details.type_aanvrager) && Boolean(details.maatregel);

  async function submit() {
    if (!regeling) return;
    setError(null);
    setSubmitting(true);
    try {
      // If user picked "MIA + Vamil", create BOTH MIA and VAMIL in sequence.
      const codes = regeling === "MIA" ? ["MIA", "VAMIL"] : [regeling];
      const body = {
        type_aanvrager: details.type_aanvrager,
        maatregel: details.maatregel,
        offerte_beschikbaar: details.offerte_beschikbaar === true,
      };
      if (details.investering_bedrag !== "" && details.investering_bedrag !== null) {
        body.investering_bedrag = Number(details.investering_bedrag);
      }
      if (details.gewenste_startdatum) {
        body.gewenste_startdatum = details.gewenste_startdatum;
      }
      let firstId = null;
      for (const code of codes) {
        const { data } = await api.post("/aanvragen", {
          ...body,
          regeling: code,
        });
        if (!firstId) firstId = data.id;
      }
      if (firstId) {
        navigate(`/aanvraag/${firstId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-50 py-8 sm:py-12 min-h-[calc(100vh-64px)]">
      <div className="container-app max-w-3xl">
        <div className="mb-4 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-brand-green hover:underline"
          >
            ← Terug naar dashboard
          </Link>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
          <StepIndicator step={step} />
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Nieuwe aanvraag
          </h1>

          {step === 1 && (
            <div className="mt-6 grid gap-3">
              <p className="text-sm text-gray-600">
                Kies de regeling waarvoor u een aanvraag wilt starten. Niet
                zeker? Doe eerst de{" "}
                <Link to="/subsidiecheck" className="font-semibold text-brand-green hover:underline">
                  gratis subsidiecheck
                </Link>
                .
              </p>
              {REGELING_CARDS.map((r) => (
                <SelectableCard
                  key={r.id}
                  selected={regeling === r.id}
                  onClick={() => setRegeling(r.id)}
                  title={r.title}
                  description={r.description}
                />
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 grid gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Type aanvrager
                </label>
                <select
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                  value={details.type_aanvrager}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, type_aanvrager: e.target.value }))
                  }
                >
                  {TYPE_AANVRAGER_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {typeAanvragerLabel(v)}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset>
                <legend className="text-sm font-semibold text-gray-800">
                  Welke maatregel?
                </legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {MAATREGEL_OPTIONS.map((m) => (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                        details.maatregel === m.id
                          ? "border-brand-green bg-brand-greenLight font-semibold text-brand-green"
                          : "border-gray-200 bg-white text-gray-800 hover:border-brand-green hover:bg-brand-greenLight/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="maatregel"
                        className="accent-brand-green"
                        checked={details.maatregel === m.id}
                        onChange={() =>
                          setDetails((d) => ({ ...d, maatregel: m.id }))
                        }
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Geschatte investering (€){" "}
                  <span className="font-normal text-gray-500">(optioneel)</span>
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    €
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    placeholder="bv. 9000"
                    value={details.investering_bedrag}
                    onChange={(e) =>
                      setDetails((d) => ({
                        ...d,
                        investering_bedrag:
                          e.target.value === "" ? "" : Number(e.target.value),
                      }))
                    }
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-7 pr-3"
                  />
                </div>
              </div>

              <fieldset>
                <legend className="text-sm font-semibold text-gray-800">
                  Heeft u al een offerte?
                </legend>
                <div className="mt-2 inline-flex rounded-lg bg-gray-100 p-1">
                  {[
                    { id: true, label: "Ja" },
                    { id: false, label: "Nee, nog niet" },
                  ].map((opt) => (
                    <button
                      key={String(opt.id)}
                      type="button"
                      onClick={() =>
                        setDetails((d) => ({
                          ...d,
                          offerte_beschikbaar: opt.id,
                        }))
                      }
                      className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                        details.offerte_beschikbaar === opt.id
                          ? "bg-white text-brand-green shadow"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Gewenste startdatum{" "}
                  <span className="font-normal text-gray-500">(optioneel)</span>
                </label>
                <input
                  type="date"
                  value={details.gewenste_startdatum}
                  onChange={(e) =>
                    setDetails((d) => ({
                      ...d,
                      gewenste_startdatum: e.target.value,
                    }))
                  }
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-6 grid gap-4">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  {effectiveRegelingen.map((c) => (
                    <RegelingBadge key={c} code={c} />
                  ))}
                  {regeling === "MIA" && (
                    <span className="text-xs text-gray-500">
                      (MIA + Vamil worden altijd samen aangevraagd)
                    </span>
                  )}
                </div>
                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Regeling</dt>
                    <dd className="font-semibold text-gray-900">
                      {regeling && regelingLabel(regeling)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Type aanvrager</dt>
                    <dd className="font-semibold text-gray-900">
                      {typeAanvragerLabel(details.type_aanvrager)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Maatregel</dt>
                    <dd className="font-semibold text-gray-900">
                      {maatregelLabel(details.maatregel)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Investering</dt>
                    <dd className="font-semibold text-gray-900">
                      {details.investering_bedrag
                        ? formatEuro(details.investering_bedrag)
                        : "Nog onbekend"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Offerte beschikbaar</dt>
                    <dd className="font-semibold text-gray-900">
                      {details.offerte_beschikbaar ? "Ja" : "Nee"}
                    </dd>
                  </div>
                  {details.gewenste_startdatum && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Gewenste startdatum</dt>
                      <dd className="font-semibold text-gray-900">
                        {details.gewenste_startdatum}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {deadlineText && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <strong>Deadline:</strong> {deadlineText}
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Benodigde documenten
                </h3>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {effectiveRegelingen.flatMap((code) =>
                    (REQUIRED_DOCS[code] ?? []).map((label, i) => (
                      <li
                        key={`${code}-${i}`}
                        className="flex items-start gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700"
                      >
                        <span className="mt-0.5 text-brand-green">•</span>
                        <span>
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {code}
                          </span>{" "}
                          — {label}
                        </span>
                      </li>
                    )),
                  )}
                </ul>
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || submitting}
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Terug
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={
                  (step === 1 && !canContinue1) ||
                  (step === 2 && !canContinue2)
                }
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Volgende
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Aanvraag aanmaken…" : "Aanvraag aanmaken"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
