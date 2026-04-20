import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import PageMeta from "../../components/PageMeta.jsx";
import { api } from "../../lib/api.js";

/**
 * After Stripe Checkout redirects the klant back here we don't yet know
 * whether the webhook has fired. Poll /users/me until the status flips
 * to "active", or give up after ~15 seconds and show the user a CTA to
 * continue to the dashboard (the webhook might simply be delayed —
 * nothing is broken).
 */
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 10;

export default function OnboardingSuccess() {
  const [status, setStatus] = useState("pending");
  const [plan, setPlan] = useState(null);
  const pollRef = useRef(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const { data } = await api.get("/users/me");
        if (cancelled) return;
        const nextStatus = data?.user?.subscription_status;
        const nextPlan = data?.user?.subscription_plan;
        setStatus(nextStatus || "pending");
        if (nextPlan) setPlan(nextPlan);
        if (nextStatus === "active") {
          clearInterval(pollRef.current);
        }
      } catch {
        // ignore transient errors; the interval keeps trying
      }
      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
        clearInterval(pollRef.current);
      }
    }

    tick();
    pollRef.current = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const isActive = status === "active";

  return (
    <div className="bg-brand-greenLight py-16 md:py-24">
      <PageMeta
        title="Abonnement geactiveerd"
        description="Uw AAA-Subsidies abonnement wordt verwerkt."
      />
      <div className="container-app">
        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-greenLight text-brand-green">
            <span className="text-2xl font-bold">✓</span>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
            {isActive ? "Uw abonnement is actief!" : "Abonnement wordt verwerkt…"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            {isActive
              ? `Welkom bij AAA-Subsidies${plan ? ` — ${capitalize(plan)} plan` : ""}. U kunt nu aan de slag met uw eerste aanvraag.`
              : "De betaling is gelukt. We wachten nog even op de bevestiging van Stripe (dit duurt normaal gesproken een paar seconden)."}
          </p>

          {!isActive && (
            <div className="mt-5 flex items-center justify-center gap-3 text-xs text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-greenLight border-t-brand-green" />
              <span>Status controleren…</span>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/dashboard" className="btn-primary">
              Naar dashboard
            </Link>
            <Link to="/aanvraag/nieuw" className="btn-secondary">
              Start een aanvraag
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
