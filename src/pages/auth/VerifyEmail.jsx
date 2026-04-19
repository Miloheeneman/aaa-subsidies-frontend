import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api, apiErrorMessage } from "../../lib/api.js";
import AuthShell, { FormError, FormSuccess } from "./AuthShell.jsx";

export default function VerifyEmail() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, error: null, message: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, message: null });
    api
      .post(`/auth/verify-email/${token}`)
      .then((res) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          message: res.data?.message || "Uw e-mailadres is geverifieerd.",
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: apiErrorMessage(err, "Verificatie mislukt."),
          message: null,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthShell title="E-mail verifiëren">
      {state.loading ? (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-greenLight border-t-brand-green" />
          <p className="mt-3 text-sm text-gray-600">
            Uw e-mailadres wordt geverifieerd…
          </p>
        </div>
      ) : state.error ? (
        <div className="grid gap-4">
          <FormError>{state.error}</FormError>
          <p className="text-sm text-gray-600">
            De link is mogelijk verlopen of al gebruikt. Probeer opnieuw in
            te loggen; u kunt dan een nieuwe verificatie-e-mail aanvragen.
          </p>
          <Link to="/login" className="btn-primary text-center">
            Naar inloggen
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          <FormSuccess>{state.message}</FormSuccess>
          <Link to="/login" className="btn-primary text-center">
            Inloggen
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
