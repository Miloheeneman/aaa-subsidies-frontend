import { useMemo, useState } from "react";

import { apiErrorMessage } from "../../lib/api.js";
import {
  MAATREGEL_TYPE_LABELS,
  formatEuro,
  maatregelTypeLabel,
} from "../../lib/formatters.js";
import { createMaatregel } from "../../lib/pandenApi.js";

// Groepering voor stap 1.
const GROUPS = [
  {
    titel: "Warmte",
    items: [
      {
        id: "warmtepomp_lucht_water",
        icon: "♨️",
        regeling: "ISDE",
        description: "Lucht/water warmtepomp.",
      },
      {
        id: "warmtepomp_water_water",
        icon: "♨️",
        regeling: "ISDE",
        description: "Water/water (bodem) warmtepomp.",
      },
      {
        id: "warmtepomp_hybride",
        icon: "♨️",
        regeling: "ISDE",
        description: "Hybride warmtepomp (combinatie met ketel).",
      },
      {
        id: "zonneboiler",
        icon: "☀️",
        regeling: "ISDE",
        description: "Zonneboiler voor warm tapwater.",
      },
    ],
  },
  {
    titel: "Isolatie",
    items: [
      {
        id: "dakisolatie",
        icon: "🏠",
        regeling: "ISDE",
        description: "Dakisolatie — voor/na foto's verplicht.",
      },
      {
        id: "gevelisolatie",
        icon: "🧱",
        regeling: "ISDE",
        description: "Gevel- of spouwmuurisolatie.",
      },
      {
        id: "vloerisolatie",
        icon: "🧱",
        regeling: "ISDE",
        description: "Vloer- of bodemisolatie.",
      },
      {
        id: "hr_glas",
        icon: "🪟",
        regeling: "ISDE",
        description: "HR++ of triple glas.",
      },
    ],
  },
  {
    titel: "Zakelijk",
    items: [
      {
        id: "eia_investering",
        icon: "🏢",
        regeling: "EIA",
        description: "Energie-investering voor zakelijk vastgoed.",
      },
      {
        id: "mia_vamil_investering",
        icon: "🌱",
        regeling: "MIA",
        description: "Milieu-investering (MIA + Vamil).",
      },
      {
        id: "dumava_maatregel",
        icon: "🏥",
        regeling: "DUMAVA",
        description: "Maatschappelijk vastgoed.",
      },
    ],
  },
];

const EIA_MIA_TYPES = new Set(["eia_investering", "mia_vamil_investering"]);

export default function NieuweMaatregelModal({ pand, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [values, setValues] = useState({
    omschrijving: "",
    apparaat_merk: "",
    apparaat_typenummer: "",
    apparaat_meldcode: "",
    installateur_naam: "",
    installateur_kvk: "",
    installateur_gecertificeerd: false,
    installatie_datum: "",
    offerte_datum: "",
    investering_bedrag: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const allItems = useMemo(() => GROUPS.flatMap((g) => g.items), []);
  const selectedItem = useMemo(
    () => allItems.find((i) => i.id === selected),
    [allItems, selected],
  );
  const isEiaMia = selected && EIA_MIA_TYPES.has(selected);
  const isIsde = selectedItem?.regeling === "ISDE";

  function update(patch) {
    setValues((v) => ({ ...v, ...patch }));
  }

  async function handleSubmit() {
    if (!selectedItem) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        maatregel_type: selectedItem.id,
        omschrijving: values.omschrijving.trim() || null,
        apparaat_merk: values.apparaat_merk.trim() || null,
        apparaat_typenummer: values.apparaat_typenummer.trim() || null,
        apparaat_meldcode: values.apparaat_meldcode.trim() || null,
        installateur_naam: values.installateur_naam.trim() || null,
        installateur_kvk: values.installateur_kvk.trim() || null,
        installateur_gecertificeerd: Boolean(values.installateur_gecertificeerd),
        installatie_datum: values.installatie_datum || null,
        offerte_datum: values.offerte_datum || null,
        investering_bedrag: values.investering_bedrag
          ? Number(values.investering_bedrag)
          : null,
      };
      const created = await createMaatregel(pand.id, payload);
      onCreated?.(created);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 md:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nieuwe-maatregel-title"
    >
      <div className="relative my-4 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2
              id="nieuwe-maatregel-title"
              className="text-xl font-bold text-gray-900"
            >
              Nieuwe maatregel — {pand.straat} {pand.huisnummer}
            </h2>
            <p className="text-sm text-gray-500">Stap {step} van 3</p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-gray-400 hover:text-gray-700"
            onClick={onClose}
            aria-label="Sluit"
          >
            ✕
          </button>
        </div>

        {step === 1 && (
          <div className="mt-5 space-y-5">
            {GROUPS.map((group) => (
              <div key={group.titel}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {group.titel}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected(item.id)}
                      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                        selected === item.id
                          ? "border-brand-green bg-brand-greenLight ring-1 ring-brand-green/30"
                          : "border-gray-200 bg-white hover:border-brand-green/40"
                      }`}
                    >
                      <span className="text-2xl" aria-hidden>
                        {item.icon}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {maatregelTypeLabel(item.id)}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-600">
                          {item.description}
                        </div>
                        <div className="mt-1 text-xs font-semibold uppercase text-brand-green">
                          {item.regeling}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {isEiaMia && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <strong className="font-bold">Let op:</strong> u moet deze
                subsidie aanvragen <u>vóór</u> u akkoord geeft op de offerte.
                Zodra u tekent vervalt het recht op EIA/MIA in veel gevallen.
              </div>
            )}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary !py-2 !px-4 text-sm"
              >
                Annuleren
              </button>
              <button
                type="button"
                disabled={!selected}
                className="btn-primary !py-2 !px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setStep(2)}
              >
                Volgende →
              </button>
            </div>
          </div>
        )}

        {step === 2 && selectedItem && (
          <div className="mt-5 space-y-4">
            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              <strong className="font-bold">
                {maatregelTypeLabel(selectedItem.id)}
              </strong>{" "}
              · Regeling: <strong>{selectedItem.regeling}</strong>
            </div>

            {isIsde && (
              <div className="grid gap-4 sm:grid-cols-2">
                <ModalField
                  label="Apparaat merk"
                  value={values.apparaat_merk}
                  onChange={(v) => update({ apparaat_merk: v })}
                />
                <ModalField
                  label="Typenummer"
                  value={values.apparaat_typenummer}
                  onChange={(v) => update({ apparaat_typenummer: v })}
                />
                <ModalField
                  label="ISDE meldcode"
                  value={values.apparaat_meldcode}
                  onChange={(v) => update({ apparaat_meldcode: v })}
                  hint="Staat op de factuur; verplicht voor ISDE-aanvraag."
                />
                <ModalField
                  label="Installatiedatum"
                  type="date"
                  value={values.installatie_datum}
                  onChange={(v) => update({ installatie_datum: v })}
                />
                <ModalField
                  label="Installateur"
                  value={values.installateur_naam}
                  onChange={(v) => update({ installateur_naam: v })}
                />
                <ModalField
                  label="KvK installateur"
                  value={values.installateur_kvk}
                  onChange={(v) => update({ installateur_kvk: v })}
                />
              </div>
            )}

            {isEiaMia && (
              <div className="grid gap-4 sm:grid-cols-2">
                <ModalField
                  label="Offertedatum"
                  type="date"
                  value={values.offerte_datum}
                  onChange={(v) => update({ offerte_datum: v })}
                  hint="Deadline = offertedatum + 3 maanden."
                />
                <ModalField
                  label="Investering (€)"
                  type="number"
                  step="0.01"
                  value={values.investering_bedrag}
                  onChange={(v) => update({ investering_bedrag: v })}
                />
                <div className="sm:col-span-2">
                  <ModalTextarea
                    label="Omschrijving investering"
                    value={values.omschrijving}
                    onChange={(v) => update({ omschrijving: v })}
                  />
                </div>
              </div>
            )}

            {!isIsde && !isEiaMia && (
              <div className="grid gap-4 sm:grid-cols-2">
                <ModalField
                  label="Offertedatum"
                  type="date"
                  value={values.offerte_datum}
                  onChange={(v) => update({ offerte_datum: v })}
                />
                <ModalField
                  label="Investering (€)"
                  type="number"
                  step="0.01"
                  value={values.investering_bedrag}
                  onChange={(v) => update({ investering_bedrag: v })}
                />
              </div>
            )}

            {isIsde && (
              <div>
                <ModalField
                  label="Investering (€) — optioneel"
                  type="number"
                  step="0.01"
                  value={values.investering_bedrag}
                  onChange={(v) => update({ investering_bedrag: v })}
                  hint="Gebruiken we voor een indicatieve subsidieschatting."
                />
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary !py-2 !px-4 text-sm"
              >
                ← Terug
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-primary !py-2 !px-4 text-sm"
              >
                Volgende →
              </button>
            </div>
          </div>
        )}

        {step === 3 && selectedItem && (
          <Step3Overview
            pand={pand}
            selectedItem={selectedItem}
            values={values}
            onBack={() => setStep(2)}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

function Step3Overview({
  pand,
  selectedItem,
  values,
  onBack,
  onSubmit,
  submitting,
  error,
}) {
  // Eenvoudige schatting spiegel van backend (voor UI-preview).
  const PCT = {
    ISDE: 0.3,
    EIA: 0.1365,
    MIA: 0.135,
    VAMIL: 0.02,
    DUMAVA: 0.3,
  };
  const investering = values.investering_bedrag
    ? Number(values.investering_bedrag)
    : 0;
  const preview =
    investering > 0 && PCT[selectedItem.regeling]
      ? investering * PCT[selectedItem.regeling]
      : 0;

  let deadlineHint = "Geen automatische deadline.";
  if (selectedItem.regeling === "ISDE") {
    deadlineHint = values.installatie_datum
      ? `ISDE: uiterlijk 24 maanden na installatie (${values.installatie_datum}).`
      : "ISDE: deadline start pas na installatie.";
  } else if (["EIA", "MIA", "VAMIL"].includes(selectedItem.regeling)) {
    deadlineHint = values.offerte_datum
      ? `${selectedItem.regeling}: 3 maanden na offertedatum (${values.offerte_datum}).`
      : `${selectedItem.regeling}: 3 maanden na offerte — vul offertedatum in zodra u er een heeft.`;
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Overzicht
        </div>
        <ul className="space-y-1 text-gray-800">
          <li>
            <strong>Pand:</strong> {pand.straat} {pand.huisnummer},{" "}
            {pand.postcode} {pand.plaats}
          </li>
          <li>
            <strong>Maatregel:</strong>{" "}
            {MAATREGEL_TYPE_LABELS[selectedItem.id] ?? selectedItem.id}
          </li>
          <li>
            <strong>Regeling:</strong> {selectedItem.regeling}
          </li>
          {values.installatie_datum && (
            <li>
              <strong>Installatiedatum:</strong> {values.installatie_datum}
            </li>
          )}
          {values.offerte_datum && (
            <li>
              <strong>Offertedatum:</strong> {values.offerte_datum}
            </li>
          )}
          {investering > 0 && (
            <li>
              <strong>Investering:</strong> {formatEuro(investering)}
            </li>
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-brand-green/20 bg-brand-greenLight/60 p-4 text-sm text-gray-800">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
          Indicatieve berekening
        </div>
        <p>
          <strong>Geschatte subsidie:</strong>{" "}
          {preview > 0 ? formatEuro(preview) : "—"}
        </p>
        <p className="mt-1">
          <strong>Deadline:</strong> {deadlineHint}
        </p>
        <p className="mt-2 text-xs text-gray-600">
          Dit is een indicatieve berekening. De definitieve subsidie wordt
          bepaald door RVO.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary !py-2 !px-4 text-sm"
        >
          ← Terug
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="btn-primary !py-2 !px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Bezig..." : "Maatregel toevoegen"}
        </button>
      </div>
    </div>
  );
}

function ModalField({ label, value, onChange, type = "text", step, hint }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800">
        {label}
      </label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
      />
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function ModalTextarea({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800">
        {label}
      </label>
      <textarea
        rows="2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
      />
    </div>
  );
}
