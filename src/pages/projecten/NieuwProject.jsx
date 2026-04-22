import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import UpgradeModal from "../../components/projecten/UpgradeModal.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import {
  EIGENAAR_TYPES,
  PROJECT_TYPES,
  createProject,
} from "../../lib/projecten.js";

const POSTCODE_RE = /^[1-9]\d{3}\s?[A-Za-z]{2}$/;

const EMPTY = {
  straat: "",
  huisnummer: "",
  postcode: "",
  plaats: "",
  bouwjaar: "",
  project_type: "woning",
  eigenaar_type: "eigenaar_bewoner",
};

export default function NieuwProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [upgradeQuota, setUpgradeQuota] = useState(null);

  const bouwjaar = Number(form.bouwjaar);
  const isdeWarning = useMemo(() => {
    return (
      form.bouwjaar !== "" &&
      Number.isInteger(bouwjaar) &&
      bouwjaar >= 2019 &&
      ["woning", "appartement"].includes(form.project_type)
    );
  }, [form.bouwjaar, form.project_type, bouwjaar]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!form.straat.trim() || !form.huisnummer.trim() || !form.plaats.trim()) {
      setError("Straat, huisnummer en plaats zijn verplicht.");
      return;
    }
    if (!POSTCODE_RE.test(form.postcode.trim())) {
      setError("Postcode moet in de vorm 1234 AB zijn.");
      return;
    }
    if (!form.bouwjaar || !Number.isInteger(bouwjaar)) {
      setError("Bouwjaar is verplicht (bijv. 1985).");
      return;
    }
    if (bouwjaar < 1500 || bouwjaar > new Date().getFullYear() + 1) {
      setError("Voer een realistisch bouwjaar in.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createProject({
        ...form,
        bouwjaar,
        postcode: form.postcode.trim().toUpperCase().replace(/\s+/g, " "),
      });
      navigate(`/projecten/${created.id}`, { replace: true });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (detail?.code === "PLAN_LIMIT_REACHED") {
        setUpgradeQuota({
          plan: detail.plan,
          limit: detail.limit,
          used: detail.used,
          exceeded: true,
        });
      } else {
        setError(apiErrorMessage(err, "Project aanmaken mislukt."));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-app max-w-3xl py-8 sm:py-10">
      <Link
        to="/projecten"
        className="text-sm font-semibold text-brand-green hover:underline"
      >
        ← Terug naar projecten
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Nieuw project toevoegen
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Vul de basisgegevens van uw project in. AAA-Lex vult energielabel,
        oppervlakte en notities in na de opname.
      </p>

      <form
        onSubmit={submit}
        className="mt-6 space-y-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <section>
          <h2 className="text-base font-bold text-gray-900">Projectgegevens</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Straat *">
              <input
                className="input"
                value={form.straat}
                onChange={(e) => set("straat", e.target.value)}
                required
              />
            </Field>
            <Field label="Huisnummer *">
              <input
                className="input"
                value={form.huisnummer}
                onChange={(e) => set("huisnummer", e.target.value)}
                required
              />
            </Field>
            <Field label="Postcode *" helper="Format: 1234 AB">
              <input
                className="input"
                value={form.postcode}
                onChange={(e) => set("postcode", e.target.value)}
                placeholder="1234 AB"
                required
              />
            </Field>
            <Field label="Plaats *">
              <input
                className="input"
                value={form.plaats}
                onChange={(e) => set("plaats", e.target.value)}
                required
              />
            </Field>
            <Field
              label="Bouwjaar *"
              helper="Verplicht voor de ISDE-check."
            >
              <input
                className="input"
                type="number"
                min={1500}
                max={new Date().getFullYear() + 1}
                value={form.bouwjaar}
                onChange={(e) => set("bouwjaar", e.target.value)}
                placeholder="1985"
                required
              />
            </Field>
            <Field label="Type project *">
              <select
                className="input"
                value={form.project_type}
                onChange={(e) => set("project_type", e.target.value)}
              >
                {PROJECT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type eigenaar *">
              <select
                className="input"
                value={form.eigenaar_type}
                onChange={(e) => set("eigenaar_type", e.target.value)}
              >
                {EIGENAAR_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {isdeWarning && (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <strong>Let op:</strong> voor ISDE-subsidie bij warmtepompen of
              isolatie is het bouwjaar van de woning meestal vóór 2019 vereist.
              Andere regelingen (EIA, MIA/Vamil, DUMAVA) blijven mogelijk.
            </div>
          )}
        </section>

        <section>
          <h2 className="text-base font-bold text-gray-900">
            AAA-Lex informatie
          </h2>
          <div className="mt-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
            AAA-Lex vult dit in na de opname:
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Huidig energielabel en label na maatregelen</li>
              <li>Gebruiksoppervlakte (m²)</li>
              <li>Notities van de opname</li>
            </ul>
          </div>
        </section>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <Link to="/projecten" className="btn-secondary">
            Annuleren
          </Link>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? "Bezig…" : "Project opslaan"}
          </button>
        </div>
      </form>

      <UpgradeModal
        open={!!upgradeQuota}
        onClose={() => setUpgradeQuota(null)}
        quota={upgradeQuota}
      />
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
