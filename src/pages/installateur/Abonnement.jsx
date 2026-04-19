import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import api, { apiErrorMessage } from "../../lib/api.js";
import { formatDate } from "../../lib/formatters.js";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "€49",
    period: "per maand",
    features: [
      "Tot 10 actieve dossiers",
      "Toegang tot leads in uw regio",
      "Dossier tracking",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "€99",
    period: "per maand",
    recommended: true,
    features: [
      "Onbeperkte dossiers",
      "Prioriteit bij lead toewijzing",
      "Uitgebreide statistieken",
    ],
  },
];

function PlanCard({ plan, onSelect, busy, currentPlan }) {
  const isCurrent = currentPlan === plan.id;
  return (
    <div
      className={`relative rounded-xl border p-6 ${
        plan.recommended
          ? "border-brand-green bg-brand-greenLight/40"
          : "border-gray-200 bg-white"
      }`}
    >
      {plan.recommended && (
        <span className="absolute -top-3 right-4 rounded-full bg-brand-green px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          Aanbevolen
        </span>
      )}
      <div className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        {plan.name}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-gray-900">
          {plan.price}
        </span>
        <span className="text-sm text-gray-600">{plan.period}</span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-gray-700">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-green" />
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={busy || isCurrent}
        onClick={() => onSelect(plan.id)}
        className={`mt-6 w-full ${
          plan.recommended ? "btn-primary" : "btn-secondary"
        } !py-2 text-sm`}
      >
        {isCurrent
          ? "Huidig plan"
          : busy
            ? "Bezig…"
            : `Start ${plan.name} abonnement`}
      </button>
    </div>
  );
}

export default function Abonnement() {
  const [params, setParams] = useSearchParams();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const success = params.get("success");
    const cancelled = params.get("cancelled");
    if (success) {
      setBanner({
        type: "success",
        text: "Bedankt — uw abonnement wordt geactiveerd. Dit kan enkele seconden duren.",
      });
    } else if (cancelled) {
      setBanner({
        type: "info",
        text: "Checkout geannuleerd. U kunt het later opnieuw proberen.",
      });
    }
    if (success || cancelled) {
      const next = new URLSearchParams(params);
      next.delete("success");
      next.delete("cancelled");
      next.delete("session_id");
      setParams(next, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadStatus() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/stripe/subscription-status");
      setSub(res.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function startCheckout(plan) {
    setBusy(true);
    setError(null);
    try {
      const res = await api.post("/stripe/create-checkout-session", { plan });
      if (res.data?.url) {
        window.location.assign(res.data.url);
      } else {
        setError("Geen checkout URL ontvangen.");
      }
    } catch (err) {
      setError(apiErrorMessage(err));
      setBusy(false);
    }
  }

  async function openPortal() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.post("/stripe/customer-portal");
      if (res.data?.url) {
        window.location.assign(res.data.url);
      }
    } catch (err) {
      setError(apiErrorMessage(err));
      setBusy(false);
    }
  }

  const isActive = sub?.status === "active";

  return (
    <div className="container-app py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Abonnement</h1>
        <p className="text-sm text-gray-600">
          Beheer uw installateur abonnement bij AAA-Subsidies.
        </p>
      </div>

      {banner && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            banner.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-gray-200 bg-gray-50 text-gray-700"
          }`}
        >
          {banner.text}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Laden…
        </div>
      ) : (
        <>
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-bold text-gray-900">
              Huidige status
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Plan
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {sub?.plan === "pro"
                    ? "Pro (€99/mnd)"
                    : sub?.plan === "starter"
                      ? "Starter (€49/mnd)"
                      : "Geen plan"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Status
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {isActive
                    ? "Actief"
                    : sub?.status === "cancelled"
                      ? "Geannuleerd"
                      : sub?.status || "Niet actief"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Volgende factuur
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatDate(sub?.next_billing_date)}
                </div>
              </div>
            </div>
            {sub?.has_customer && (
              <button
                type="button"
                disabled={busy}
                onClick={openPortal}
                className="btn-secondary mt-5 !py-2 !px-4 text-sm"
              >
                Beheer abonnement
              </button>
            )}
          </div>

          {!isActive && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-900">
                Kies uw abonnement
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {PLANS.map((p) => (
                  <PlanCard
                    key={p.id}
                    plan={p}
                    onSelect={startCheckout}
                    busy={busy}
                    currentPlan={sub?.plan}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
