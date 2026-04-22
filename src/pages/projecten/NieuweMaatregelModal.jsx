import { useMemo, useState } from "react";

import { RegelingBadge } from "../../components/StatusBadge.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import { formatEuro } from "../../lib/formatters.js";
import {
  MAATREGEL_GROEPEN,
  createMaatregel,
  maatregelLabel,
} from "../../lib/projecten.js";

/**
 * 3-staps modal voor het aanmaken van een Maatregel.
 *
 * 1. Type selecteren (grid per categorie).
 * 2. Details invullen (velden schalen op het type — warmtepomp vs EIA).
 * 3. Overzicht + bevestigen (toont berekende deadline en geschatte subsidie).
 */
export default function NieuweMaatregelModal({ project, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    maatregel_type: null,
    omschrijving: "",
    apparaat_merk: "",
    apparaat_typenummer: "",
    apparaat_meldcode: "",
    installateur_naam: "",
    installateur_kvk: "",
    installatie_datum: "",
    offerte_datum: "",
    investering_bedrag: "",
    geschatte_subsidie: "",
  });

  const groupItem = useMemo(() => {
    for (const g of MAATREGEL_GROEPEN) {
      const hit = g.items.find((i) => i.value === form.maatregel_type);
      if (hit) return { group: g, item: hit };
    }
    return null;
  }, [form.maatregel_type]);

  const isISDE = groupItem?.item.regeling === "ISDE";
  const isEIAMIA = ["EIA", "MIA"].includes(groupItem?.item.regeling);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function canContinue() {
    if (step === 1) return !!form.maatregel_type;
    if (step === 2) {
      // Minimale set per regeling; backend valideert niet dwingend zodat
      // klanten een maatregel kunnen opslaan en later aanvullen.
      if (isISDE) {
        return true; // installatiedatum optioneel; meldcode mag later
      }
      if (isEIAMIA) {
        return !!form.offerte_datum;
      }
      return true;
    }
    return true;
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const body = {
        maatregel_type: form.maatregel_type,
        omschrijving: form.omschrijving || null,
        apparaat_merk: form.apparaat_merk || null,
        apparaat_typenummer: form.apparaat_typenummer || null,
        apparaat_meldcode: form.apparaat_meldcode || null,
        installateur_naam: form.installateur_naam || null,
        installateur_kvk: form.installateur_kvk || null,
        installatie_datum: form.installatie_datum || null,
        offerte_datum: form.offerte_datum || null,
        investering_bedrag: form.investering_bedrag
          ? Number(form.investering_bedrag)
          : null,
        geschatte_subsidie: form.geschatte_subsidie
          ? Number(form.geschatte_subsidie)
          : null,
      };
      const created = await createMaatregel(project.id, body);
      onCreated?.(created);
    } catch (e) {
      setError(apiErrorMessage(e, "Opslaan mislukt"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-extrabold text-gray-900">
            Nieuwe maatregel — stap {step} van 3
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Sluiten"
          >
            ✕
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {step === 1 && <Step1 form={form} set={set} />}
          {step === 2 && (
            <Step2 form={form} set={set} isISDE={isISDE} isEIAMIA={isEIAMIA} />
          )}
          {step === 3 && (
            <Step3 form={form} groupItem={groupItem} />
          )}

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
            className="btn-secondary !py-2 !px-4 text-sm"
          >
            {step === 1 ? "Annuleren" : "← Vorige"}
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canContinue()}
              className="btn-primary !py-2 !px-4 text-sm disabled:opacity-50"
            >
              Volgende →
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="btn-primary !py-2 !px-4 text-sm disabled:opacity-50"
            >
              {submitting ? "Opslaan…" : "Maatregel opslaan"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function Step1({ form, set }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        Welke maatregel wilt u toevoegen? Dit bepaalt de benodigde documenten
        en de regeling-deadline.
      </p>
      {MAATREGEL_GROEPEN.map((g) => (
        <div key={g.titel}>
          <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-gray-500">
            {g.titel}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {g.items.map((i) => {
              const active = form.maatregel_type === i.value;
              return (
                <button
                  key={i.value}
                  type="button"
                  onClick={() => set("maatregel_type", i.value)}
                  className={`flex flex-col items-start gap-1 rounded-lg border px-4 py-3 text-left transition ${
                    active
                      ? "border-brand-green bg-brand-greenLight/60 shadow-sm"
                      : "border-gray-200 bg-white hover:border-brand-green/40"
                  }`}
                >
                  <span className="font-semibold text-gray-900">{i.label}</span>
                  <span className="text-xs text-gray-500">
                    Regeling: {i.regeling}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Step2({ form, set, isISDE, isEIAMIA }) {
  return (
    <div className="space-y-5">
      {isEIAMIA && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>Let op:</strong> u moet deze subsidie aanvragen{" "}
          <em>vóór</em> u akkoord geeft op de offerte. Aanvraag binnen 3
          maanden na offertedatum.
        </div>
      )}
      <Field label="Omschrijving (optioneel)">
        <textarea
          className="input"
          rows={2}
          value={form.omschrijving}
          onChange={(e) => set("omschrijving", e.target.value)}
          placeholder="Korte toelichting op deze maatregel"
        />
      </Field>

      {(isISDE || !isEIAMIA) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Merk apparaat">
            <input
              className="input"
              value={form.apparaat_merk}
              onChange={(e) => set("apparaat_merk", e.target.value)}
            />
          </Field>
          <Field label="Typenummer">
            <input
              className="input"
              value={form.apparaat_typenummer}
              onChange={(e) => set("apparaat_typenummer", e.target.value)}
            />
          </Field>
          <Field
            label="Meldcode"
            helper="Verplicht voor ISDE — u kunt deze later invullen."
          >
            <input
              className="input"
              value={form.apparaat_meldcode}
              onChange={(e) => set("apparaat_meldcode", e.target.value)}
              placeholder="Bijv. KA12345"
            />
          </Field>
          <Field label="Installatiedatum">
            <input
              type="date"
              className="input"
              value={form.installatie_datum}
              onChange={(e) => set("installatie_datum", e.target.value)}
            />
          </Field>
          <Field label="Installateur">
            <input
              className="input"
              value={form.installateur_naam}
              onChange={(e) => set("installateur_naam", e.target.value)}
            />
          </Field>
          <Field label="KvK installateur">
            <input
              className="input"
              value={form.installateur_kvk}
              onChange={(e) => set("installateur_kvk", e.target.value)}
            />
          </Field>
        </div>
      )}

      {isEIAMIA && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Offertedatum *" helper="Start van de 3-maanden termijn.">
            <input
              type="date"
              className="input"
              value={form.offerte_datum}
              onChange={(e) => set("offerte_datum", e.target.value)}
              required
            />
          </Field>
          <Field label="Investeringsbedrag (€)">
            <input
              type="number"
              min={0}
              step="0.01"
              className="input"
              value={form.investering_bedrag}
              onChange={(e) => set("investering_bedrag", e.target.value)}
            />
          </Field>
        </div>
      )}

      <Field
        label="Geschatte subsidie (€) — optioneel"
        helper="Leeg laten = automatisch berekend op basis van maatregeltype en investering."
      >
        <input
          type="number"
          min={0}
          step="0.01"
          className="input"
          value={form.geschatte_subsidie}
          onChange={(e) => set("geschatte_subsidie", e.target.value)}
          placeholder="Leeg = AAA-Lex schat automatisch"
        />
      </Field>

      <LivePreview form={form} isISDE={isISDE} isEIAMIA={isEIAMIA} />
    </div>
  );
}

function LivePreview({ form, isISDE, isEIAMIA }) {
  const regeling = isISDE ? "ISDE" : isEIAMIA ? "EIA" : null;
  const deadline = computeFrontendDeadline(form, regeling);
  const estimate =
    form.geschatte_subsidie
      ? Number(form.geschatte_subsidie)
      : estimateSubsidieClient(
          form.maatregel_type,
          form.investering_bedrag ? Number(form.investering_bedrag) : null
        );

  if (!estimate && !deadline) return null;

  return (
    <div className="rounded-xl border border-brand-green/20 bg-brand-greenLight/50 p-4 text-sm">
      <div className="text-xs font-extrabold uppercase tracking-wide text-brand-greenDark">
        Live schatting
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-y-1">
        <dt className="text-gray-600">Geschatte subsidie</dt>
        <dd className="font-semibold text-gray-900">
          {estimate ? `± ${formatEuro(estimate)}` : "—"}
        </dd>
        <dt className="text-gray-600">Indienen voor</dt>
        <dd className="font-semibold text-gray-900">{deadline || "—"}</dd>
      </dl>
      <p className="mt-2 text-xs text-gray-500">
        Definitieve bedragen en datums worden door AAA-Lex bevestigd.
      </p>
    </div>
  );
}

function Step3({ form, groupItem }) {
  const deadline = computeFrontendDeadline(form, groupItem?.item.regeling);
  return (
    <div className="space-y-4 text-sm text-gray-700">
      <p>
        Controleer uw invoer. Na opslaan wordt er voor deze maatregel een
        dossier aangemaakt met een checklist van benodigde documenten.
      </p>
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Maatregel
            </div>
            <div className="text-base font-bold text-gray-900">
              {maatregelLabel(form.maatregel_type)}
            </div>
          </div>
          {groupItem?.item.regeling && (
            <RegelingBadge code={groupItem.item.regeling} />
          )}
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
          {form.installatie_datum && (
            <>
              <dt className="text-gray-500">Installatiedatum</dt>
              <dd>{form.installatie_datum}</dd>
            </>
          )}
          {form.offerte_datum && (
            <>
              <dt className="text-gray-500">Offertedatum</dt>
              <dd>{form.offerte_datum}</dd>
            </>
          )}
          {form.apparaat_meldcode && (
            <>
              <dt className="text-gray-500">Meldcode</dt>
              <dd>{form.apparaat_meldcode}</dd>
            </>
          )}
          <dt className="text-gray-500">Geschatte subsidie</dt>
          <dd className="font-semibold">
            {form.geschatte_subsidie
              ? formatEuro(Number(form.geschatte_subsidie))
              : "—"}
          </dd>
          <dt className="text-gray-500">Berekende deadline</dt>
          <dd className="font-semibold">
            {deadline || (
              <span className="text-gray-400">
                Vul installatie- of offertedatum in om deadline te berekenen
              </span>
            )}
          </dd>
        </dl>
      </div>
    </div>
  );
}

function Field({ label, helper, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 inline-block font-semibold text-gray-800">
        {label}
      </span>
      {children}
      {helper && <span className="mt-1 block text-xs text-gray-500">{helper}</span>}
    </label>
  );
}

const _FLAT = {
  warmtepomp_lucht_water: 2500,
  warmtepomp_water_water: 3500,
  warmtepomp_hybride: 1500,
};
const _PCT = {
  dakisolatie: [0.2, 3000],
  gevelisolatie: [0.2, 2500],
  vloerisolatie: [0.2, 1500],
  hr_glas: [0.2, 2000],
  zonneboiler: [0.2, 2000],
  eia_investering: [0.455, null],
  mia_vamil_investering: [0.36, null],
  dumava_maatregel: [0.3, null],
};

function estimateSubsidieClient(maatregelType, investering) {
  if (!maatregelType) return null;
  if (_FLAT[maatregelType] != null) return _FLAT[maatregelType];
  const pct = _PCT[maatregelType];
  if (!pct || !investering || investering <= 0) return null;
  const [rate, cap] = pct;
  const raw = Math.round(investering * rate * 100) / 100;
  return cap != null && raw > cap ? cap : raw;
}

function computeFrontendDeadline(form, regeling) {
  // Client-side hint only — backend is the source of truth.
  if (regeling === "ISDE" && form.installatie_datum) {
    const d = new Date(form.installatie_datum);
    if (Number.isNaN(d.getTime())) return null;
    d.setMonth(d.getMonth() + 24);
    return d.toLocaleDateString("nl-NL");
  }
  if (["EIA", "MIA"].includes(regeling) && form.offerte_datum) {
    const d = new Date(form.offerte_datum);
    if (Number.isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + 90);
    return d.toLocaleDateString("nl-NL");
  }
  return null;
}
