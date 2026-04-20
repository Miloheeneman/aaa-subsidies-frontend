import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PageMeta from "../../components/PageMeta.jsx";
import { api, apiErrorMessage } from "../../lib/api.js";

const ENTERPRISE_MAILTO =
  "mailto:info@aaa-lexoffices.nl" +
  "?subject=Aanvraag%20Enterprise%20abonnement%20AAA-Subsidies" +
  "&body=Beste%20AAA-Lex%20team%2C%0A%0AIk%20wil%20graag%20een%20gesprek%20" +
  "over%20een%20Enterprise%20abonnement%20op%20AAA-Subsidies.%0A%0A" +
  "Met%20vriendelijke%20groet%2C";

const PLANS = [
  {
    id: "gratis",
    naam: "Gratis",
    prijs: "€0",
    interval: "per maand",
    highlights: [
      { label: "3 panden", included: true },
      { label: "1 gebruiker", included: true },
      { label: "Alle subsidiechecks", included: true },
      { label: "Documentbeheer", included: true },
    ],
    ctaLabel: "Start gratis",
  },
  {
    id: "starter",
    naam: "Starter",
    prijs: "€39",
    interval: "per maand",
    highlights: [
      { label: "30 panden", included: true },
      { label: "2 gebruikers", included: true },
      { label: "Alles van Gratis", included: true },
      { label: "E-mail support", included: true },
    ],
    ctaLabel: "Kies Starter",
  },
  {
    id: "pro",
    naam: "Pro",
    prijs: "€99",
    interval: "per maand",
    badge: "Meest gekozen",
    featured: true,
    highlights: [
      { label: "100 panden", included: true },
      { label: "5 gebruikers", included: true },
      { label: "Prioriteit in wachtrij", included: true },
      { label: "Dedicated accountmanager", included: true },
    ],
    ctaLabel: "Kies Pro",
  },
  {
    id: "enterprise",
    naam: "Enterprise",
    prijs: "Op aanvraag",
    interval: "",
    highlights: [
      { label: "Onbeperkt aantal panden", included: true },
      { label: "Onbeperkt aantal gebruikers", included: true },
      { label: "SSO / SAML", included: true },
      { label: "Maatwerk SLA", included: true },
    ],
    ctaLabel: "Neem contact op",
  },
];

function useQueryParams() {
  return new URLSearchParams(useLocation().search);
}

export default function OnboardingPlan() {
  const navigate = useNavigate();
  const query = useQueryParams();
  const cancelled = query.get("cancelled") === "true";

  const [me, setMe] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null); // plan id currently submitting
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelledFetch = false;
    api
      .get("/users/me")
      .then((res) => {
        if (cancelledFetch) return;
        setMe(res.data);
      })
      .catch(() => {
        // Non-fatal: the page still works without it.
      });
    return () => {
      cancelledFetch = true;
    };
  }, []);

  const currentPlan = useMemo(
    () => me?.user?.subscription_plan || null,
    [me],
  );

  async function handleChoose(planId) {
    setError(null);
    if (planId === "gratis") {
      navigate("/dashboard");
      return;
    }
    if (planId === "enterprise") {
      window.location.href = ENTERPRISE_MAILTO;
      return;
    }
    setLoadingPlan(planId);
    try {
      const { data } = await api.post(
        "/subscriptions/create-checkout-session",
        { plan: planId },
      );
      if (data?.url) {
        window.location.assign(data.url);
      } else {
        setError("Geen checkout-URL ontvangen van de server.");
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Betaling starten mislukt."));
      setLoadingPlan(null);
    }
  }

  return (
    <div className="bg-brand-greenLight py-12 md:py-20">
      <PageMeta
        title="Kies uw abonnement"
        description="Kies het AAA-Subsidies abonnement dat bij u past. Gratis starten kan altijd."
      />
      <div className="container-app">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
            Laatste stap
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-gray-900 md:text-4xl">
            Kies het abonnement dat bij u past
          </h1>
          <p className="mt-3 text-base text-gray-600">
            U kunt altijd later upgraden of downgraden. Elk betaald plan is
            maandelijks opzegbaar.
          </p>
        </div>

        {cancelled && (
          <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Betaling geannuleerd. Kies een ander plan of probeer het opnieuw
            — er is nog niets afgeschreven.
          </div>
        )}

        {error && (
          <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              current={currentPlan === plan.id}
              loading={loadingPlan === plan.id}
              disabled={loadingPlan !== null && loadingPlan !== plan.id}
              onChoose={() => handleChoose(plan.id)}
            />
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-gray-500">
          Betalingen worden veilig afgehandeld via Stripe. U ontvangt een
          factuur per e-mail. Vragen?{" "}
          <a
            className="font-semibold text-brand-green hover:underline"
            href="mailto:info@aaa-lexoffices.nl"
          >
            Neem contact op
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function PlanCard({ plan, current, loading, disabled, onChoose }) {
  const featured = plan.featured;
  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition ${
        featured
          ? "border-brand-green shadow-md ring-2 ring-brand-green/20"
          : "border-gray-200 hover:border-brand-green/50"
      }`}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-green px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {plan.badge}
        </span>
      )}
      {current && (
        <span className="absolute right-4 top-4 rounded-full bg-brand-greenLight px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-green">
          Uw huidige plan
        </span>
      )}

      <h2 className="text-lg font-bold text-gray-900">{plan.naam}</h2>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-gray-900">
          {plan.prijs}
        </span>
        {plan.interval && (
          <span className="text-sm text-gray-500">{plan.interval}</span>
        )}
      </div>

      <ul className="mt-5 flex-1 space-y-2 text-sm text-gray-700">
        {plan.highlights.map((h) => (
          <li key={h.label} className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-greenLight text-brand-green"
            >
              ✓
            </span>
            {h.label}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onChoose}
        disabled={loading || disabled}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          featured
            ? "bg-brand-green text-white hover:bg-brand-greenDark"
            : "border border-brand-green bg-white text-brand-green hover:bg-brand-greenLight"
        }`}
      >
        {loading ? "Doorverwijzen…" : plan.ctaLabel}
      </button>
    </div>
  );
}
