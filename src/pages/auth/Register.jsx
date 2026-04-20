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
      // organisation_name is optional; only send it if filled.
      const payload = { ...form };
      if (!payload.organisation_name.trim()) {
        delete payload.organisation_name;
      }
      if (!payload.phone.trim()) {
        delete payload.phone;
      }
      await api.post("/auth/register", payload);
      setSuccess(form.email);
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
        title={success ? "Bevestig uw e-mail" : "Account aanmaken"}
        subtitle={
          success
            ? "Laatste stap voordat u aan de slag kunt."
            : "Start gratis met uw subsidieaanvraag."
        }
        footer={
          success ? null : (
            <>
              Al een account?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-green hover:underline"
              >
                Inloggen
              </Link>
            </>
          )
        }
      >
        {success ? (
          <div className="grid gap-4">
            <FormSuccess>
              Bedankt voor uw registratie! Controleer uw e-mail om uw account
              te bevestigen.
            </FormSuccess>
            <p className="text-sm text-gray-600">
              We hebben een bevestigingsmail gestuurd naar{" "}
              <span className="font-semibold">{success}</span>. Klik op de
              link in die mail om uw account te activeren — daarna kiest u uw
              abonnement.
            </p>
            <p className="text-xs text-gray-500">
              Geen e-mail ontvangen? Controleer uw spam-folder of{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-green hover:underline"
              >
                log in om een nieuwe link aan te vragen
              </Link>
              .
            </p>
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
            <Field
              label="Organisatienaam"
              hint="Optioneel — laat leeg als u als particulier registreert."
            >
              <input
                name="organisation_name"
                value={form.organisation_name}
                onChange={onChange}
                className={INPUT_CLASSES}
                placeholder="Bv. Acme B.V."
              />
            </Field>

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
