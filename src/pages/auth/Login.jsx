import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import PageMeta from "../../components/PageMeta.jsx";
import { api, apiErrorMessage } from "../../lib/api.js";
import { decodeJwtPayload, setToken } from "../../lib/auth.js";
import AuthShell, {
  Field,
  FormError,
  FormSuccess,
  INPUT_CLASSES,
} from "./AuthShell.jsx";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Login() {
  const navigate = useNavigate();
  const query = useQuery();
  const next = query.get("next") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState(false);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setResent(false);
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", form);
      setToken(data.access_token);
      const payload = decodeJwtPayload(data.access_token);
      let dest = next;
      if (
        payload?.role === "admin" &&
        (dest === "/dashboard" || dest.startsWith("/dashboard"))
      ) {
        dest = "/admin";
      }
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = apiErrorMessage(err);
      if (err?.response?.status === 403 && /geverif/i.test(msg)) {
        setUnverified(true);
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    setResent(false);
    setError(null);
    try {
      // We reuse forgot-password as a proxy for "kick-off email"; in a future
      // iteration we'd expose a dedicated /auth/resend-verification.
      await api.post("/auth/forgot-password", { email: form.email });
      setResent(true);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <>
      <PageMeta
        title="Inloggen"
        description="Log in op uw AAA-Subsidies account om uw aanvragen, dossiers en abonnement te beheren."
      />
    <AuthShell
      title="Inloggen"
      subtitle="Welkom terug bij AAA-Subsidies."
      footer={
        <>
          Nog geen account?{" "}
          <Link to="/register" className="font-semibold text-brand-green hover:underline">
            Registreer hier
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <Field label="E-mailadres" required>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={onChange}
            className={INPUT_CLASSES}
          />
        </Field>
        <Field label="Wachtwoord" required>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={onChange}
            className={INPUT_CLASSES}
          />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <Link
            to="/forgot-password"
            className="font-semibold text-brand-green hover:underline"
          >
            Wachtwoord vergeten?
          </Link>
        </div>

        {resent && (
          <FormSuccess>
            Verificatie-e-mail opnieuw verstuurd (indien het adres bekend is).
          </FormSuccess>
        )}
        {error && <FormError>{error}</FormError>}
        {unverified && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Uw e-mailadres is nog niet geverifieerd.{" "}
            <button
              type="button"
              onClick={resend}
              className="font-semibold underline hover:no-underline"
            >
              Verificatie-e-mail opnieuw versturen
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Bezig met inloggen…" : "Inloggen"}
        </button>
      </form>
    </AuthShell>
    </>
  );
}
