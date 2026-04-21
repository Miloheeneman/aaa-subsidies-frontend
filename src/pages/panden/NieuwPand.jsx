import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import UpgradeModal from "../../components/panden/UpgradeModal.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import {
  EIGENAAR_TYPE_LABELS,
  PAND_TYPE_LABELS,
} from "../../lib/formatters.js";
import {
  createPand,
  isPandLimitError,
  pandLimitInfo,
} from "../../lib/pandenApi.js";

const POSTCODE_RE = /^[1-9][0-9]{3}\s?[A-Z]{2}$/i;

const EMPTY = {
  straat: "",
  huisnummer: "",
  postcode: "",
  plaats: "",
  bouwjaar: "",
  pand_type: "",
  eigenaar_type: "",
  oppervlakte_m2: "",
  notities: "",
};

export default function NieuwPand() {
  const navigate = useNavigate();
  const [values, setValues] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [upgradeInfo, setUpgradeInfo] = useState(null);

  function update(patch) {
    setValues((v) => ({ ...v, ...patch }));
  }

  function validate() {
    const errs = {};
    if (!values.straat.trim()) errs.straat = "Straat is verplicht.";
    if (!values.huisnummer.trim()) errs.huisnummer = "Huisnummer is verplicht.";
    if (!values.postcode.trim()) errs.postcode = "Postcode is verplicht.";
    else if (!POSTCODE_RE.test(values.postcode.trim()))
      errs.postcode = "Ongeldige postcode. Gebruik bijv. 1234 AB.";
    if (!values.plaats.trim()) errs.plaats = "Plaats is verplicht.";
    if (!values.bouwjaar) errs.bouwjaar = "Bouwjaar is verplicht.";
    else {
      const bj = Number(values.bouwjaar);
      if (!Number.isFinite(bj) || bj < 1500 || bj > 2100)
        errs.bouwjaar = "Voer een geldig bouwjaar in.";
    }
    if (!values.pand_type) errs.pand_type = "Type pand is verplicht.";
    if (!values.eigenaar_type)
      errs.eigenaar_type = "Type eigenaar is verplicht.";
    return errs;
  }

  const fieldErrors = validate();
  const bouwjaarNum = Number(values.bouwjaar);
  const showIsdeWarning =
    Number.isFinite(bouwjaarNum) && bouwjaarNum >= 2019;

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    if (Object.keys(fieldErrors).length > 0) return;
    setSubmitting(true);
    try {
      const payload = {
        straat: values.straat.trim(),
        huisnummer: values.huisnummer.trim(),
        postcode: values.postcode.trim().toUpperCase(),
        plaats: values.plaats.trim(),
        bouwjaar: Number(values.bouwjaar),
        pand_type: values.pand_type,
        eigenaar_type: values.eigenaar_type,
        oppervlakte_m2: values.oppervlakte_m2
          ? Number(values.oppervlakte_m2)
          : null,
        notities: values.notities.trim() || null,
      };
      const created = await createPand(payload);
      navigate(`/panden/${created.id}`, { replace: true });
    } catch (err) {
      if (isPandLimitError(err)) {
        setUpgradeInfo(pandLimitInfo(err));
      } else {
        setError(apiErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-app py-8 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-green">
            Nieuw pand
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Voeg een pand toe
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Vul onderstaande gegevens in. AAA-Lex vult later opname-data in
            (energielabel, oppervlakte) na een opnamebezoek.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          noValidate
        >
          <fieldset className="space-y-4">
            <legend className="text-sm font-bold uppercase tracking-wide text-gray-500">
              Pandgegevens
            </legend>

            <div className="grid gap-4 sm:grid-cols-[3fr_1fr]">
              <Field
                label="Straat"
                value={values.straat}
                onChange={(v) => update({ straat: v })}
                required
                error={fieldErrors.straat}
              />
              <Field
                label="Huisnummer"
                value={values.huisnummer}
                onChange={(v) => update({ huisnummer: v })}
                required
                error={fieldErrors.huisnummer}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Postcode"
                value={values.postcode}
                onChange={(v) => update({ postcode: v })}
                placeholder="1234 AB"
                required
                error={fieldErrors.postcode}
              />
              <Field
                label="Plaats"
                value={values.plaats}
                onChange={(v) => update({ plaats: v })}
                required
                error={fieldErrors.plaats}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Bouwjaar <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min="1500"
                  max="2100"
                  value={values.bouwjaar}
                  onChange={(e) => update({ bouwjaar: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                  placeholder="bv. 1985"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Verplicht voor de ISDE-check.
                </p>
                {fieldErrors.bouwjaar && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.bouwjaar}
                  </p>
                )}
                {showIsdeWarning && !fieldErrors.bouwjaar && (
                  <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Let op: ISDE-subsidie vereist doorgaans een bouwjaar{" "}
                    <strong>vóór 2019</strong>. We kijken bij de opname of uw
                    situatie toch in aanmerking komt.
                  </p>
                )}
              </div>

              <Field
                label="Oppervlakte (m²)"
                type="number"
                step="0.1"
                value={values.oppervlakte_m2}
                onChange={(v) => update({ oppervlakte_m2: v })}
                hint="Optioneel. AAA-Lex meet dit bij een opname."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Type pand"
                required
                value={values.pand_type}
                onChange={(v) => update({ pand_type: v })}
                options={Object.entries(PAND_TYPE_LABELS)}
                error={fieldErrors.pand_type}
              />
              <Select
                label="Type eigenaar"
                required
                value={values.eigenaar_type}
                onChange={(v) => update({ eigenaar_type: v })}
                options={Object.entries(EIGENAAR_TYPE_LABELS)}
                error={fieldErrors.eigenaar_type}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800">
                Notities (optioneel)
              </label>
              <textarea
                rows="3"
                value={values.notities}
                onChange={(e) => update({ notities: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                placeholder="Bijzonderheden, wensen of voorlopige planning."
              />
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
            <legend className="px-2 text-xs font-bold uppercase tracking-wide text-gray-500">
              AAA-Lex opname (wordt later ingevuld)
            </legend>
            <p className="text-sm text-gray-600">
              Huidig energielabel, energielabel na maatregelen en definitieve
              oppervlakte worden na de opname door AAA-Lex ingevuld. U kunt dit
              pand dan direct in uw dossier terugvinden.
            </p>
          </fieldset>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
            <Link to="/panden" className="btn-secondary !py-2.5 !px-5 text-sm">
              Annuleren
            </Link>
            <button
              type="submit"
              className="btn-primary !py-2.5 !px-5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={submitting || Object.keys(fieldErrors).length > 0}
            >
              {submitting ? "Bezig met opslaan..." : "Pand toevoegen"}
            </button>
          </div>
        </form>
      </div>

      <UpgradeModal
        info={upgradeInfo}
        onClose={() => setUpgradeInfo(null)}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  error,
  type = "text",
  placeholder,
  hint,
  step,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 ${
          error
            ? "border-red-300 focus:border-red-400"
            : "border-gray-200 focus:border-brand-green"
        }`}
        placeholder={placeholder}
      />
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function Select({ label, value, onChange, options, required, error }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 ${
          error
            ? "border-red-300 focus:border-red-400"
            : "border-gray-200 focus:border-brand-green"
        }`}
      >
        <option value="">— Kies —</option>
        {options.map(([val, lbl]) => (
          <option key={val} value={val}>
            {lbl}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
