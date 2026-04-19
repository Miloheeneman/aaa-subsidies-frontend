import { useState } from "react";
import { Link } from "react-router-dom";

import PageMeta from "../../components/PageMeta.jsx";
import { api, apiErrorMessage } from "../../lib/api.js";
import AuthShell, {
  Field,
  FormError,
  FormSuccess,
  INPUT_CLASSES,
} from "./AuthShell.jsx";

const INITIAL = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  organisation_name: "",
  organisation_type: "klant",
};

export default function Register() {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (form.password.length < 8) {
      setError("Kies een wachtwoord van minimaal 8 tekens.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/register", form);
      setSuccess(data?.message || "Verificatie-e-mail verstuurd.");
      setForm((f) => ({ ...INITIAL, organisation_type: f.organisation_type }));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageMeta
        title="Registreren"
        description="Maak een AAA-Subsidies account aan en start direct met uw subsidieaanvraag."
      />
    <AuthShell
      title="Account aanmaken"
      subtitle="Start gratis met uw subsidieaanvraag."
      footer={
        <>
          Al een account?{" "}
          <Link to="/login" className="font-semibold text-brand-green hover:underline">
            Inloggen
          </Link>
        </>
      }
    >
      {success ? (
        <div className="grid gap-4">
          <FormSuccess>{success}</FormSuccess>
          <p className="text-sm text-gray-600">
            Open de e-mail die we u zojuist hebben gestuurd en klik op de
            bevestigingslink om uw account te activeren.
          </p>
          <Link to="/login" className="btn-primary text-center">
            Terug naar inloggen
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Voornaam" required>
              <input
                name="first_name"
                required
                value={form.first_name}
                onChange={onChange}
                className={INPUT_CLASSES}
                autoComplete="given-name"
              />
            </Field>
            <Field label="Achternaam" required>
              <input
                name="last_name"
                required
                value={form.last_name}
                onChange={onChange}
                className={INPUT_CLASSES}
                autoComplete="family-name"
              />
            </Field>
          </div>
          <Field label="E-mailadres" required>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={onChange}
              className={INPUT_CLASSES}
              autoComplete="email"
            />
          </Field>
          <Field label="Telefoonnummer">
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={onChange}
              className={INPUT_CLASSES}
              autoComplete="tel"
              placeholder="+31 6 12345678"
            />
          </Field>
          <Field label="Wachtwoord" required hint="Minimaal 8 tekens.">
            <input
              type="password"
              name="password"
              required
              minLength={8}
              value={form.password}
              onChange={onChange}
              className={INPUT_CLASSES}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Organisatienaam" required>
            <input
              name="organisation_name"
              required
              value={form.organisation_name}
              onChange={onChange}
              className={INPUT_CLASSES}
              placeholder="Bv. Acme B.V. of uw eigen naam"
            />
          </Field>
          <fieldset>
            <legend className="block text-sm font-semibold text-gray-800">
              Ik registreer als
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { id: "klant", label: "Klant" },
                { id: "installateur", label: "Installateur" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center justify-center rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                    form.organisation_type === opt.id
                      ? "border-brand-green bg-brand-greenLight text-brand-green"
                      : "border-gray-200 bg-white text-gray-800 hover:border-brand-green hover:bg-brand-greenLight/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="organisation_type"
                    value={opt.id}
                    className="sr-only"
                    checked={form.organisation_type === opt.id}
                    onChange={onChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          {error && <FormError>{error}</FormError>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Account aanmaken…" : "Account aanmaken"}
          </button>

          <p className="text-xs text-gray-500">
            Door te registreren gaat u akkoord met de voorwaarden van
            AAA-Lex Offices. Uw gegevens worden uitsluitend gebruikt voor
            het verwerken van uw subsidieaanvraag.
          </p>
        </form>
      )}
    </AuthShell>
    </>
  );
}
