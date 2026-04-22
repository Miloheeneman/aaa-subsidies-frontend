import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import StatusBadge, { RegelingBadge } from "../components/StatusBadge.jsx";
import DeadlineBadge, {
  EnergielabelBadge,
} from "../components/projecten/DeadlineBadge.jsx";
import { api, apiErrorMessage } from "../lib/api.js";
import { setCachedMe } from "../lib/auth.js";
import {
  formatDate,
  formatEuro,
  daysUntil,
  maatregelLabel,
} from "../lib/formatters.js";
import { listProjecten, projectTypeLabel } from "../lib/projecten.js";

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "Goedenacht";
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
}

const PLAN_LABELS = {
  gratis: "Gratis",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

function PlanBadge({ plan, status }) {
  const label = PLAN_LABELS[plan] || plan;
  const pending = status === "pending";
  const cancelled = status === "cancelled" || status === "canceled";
  const tone = pending
    ? "bg-amber-50 text-amber-800 border-amber-200"
    : cancelled
    ? "bg-gray-100 text-gray-700 border-gray-200"
    : "bg-brand-greenLight text-brand-greenDark border-brand-green/30";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone}`}
      title={`Abonnement: ${label} (${status})`}
    >
      Abonnement: {label}
      {pending && <span className="opacity-70">· wordt geactiveerd</span>}
      {cancelled && <span className="opacity-70">· opgezegd</span>}
    </span>
  );
}

function Kpi({ label, value, sublabel }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
        {value}
      </div>
      {sublabel && (
        <div className="mt-1 text-xs text-gray-500">{sublabel}</div>
      )}
    </div>
  );
}

function DeadlineCell({ datum }) {
  if (!datum) return <span className="text-gray-400">—</span>;
  const days = daysUntil(datum);
  const label = formatDate(datum);
  if (days === null) return label;
  if (days < 0) {
    return (
      <span className="text-red-700">
        {label} <span className="text-xs">(verlopen)</span>
      </span>
    );
  }
  if (days <= 14) {
    return (
      <span className="text-amber-700">
        {label} <span className="text-xs">(nog {days} dagen)</span>
      </span>
    );
  }
  return <span>{label}</span>;
}

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [aanvragen, setAanvragen] = useState([]);
  const [projecten, setProjecten] = useState([]);
  const [projectenQuota, setProjectenQuota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get("/auth/me"),
      api.get("/aanvragen"),
      listProjecten().catch(() => ({ items: [], quota: null })),
    ])
      .then(([meRes, aanRes, projectRes]) => {
        if (cancelled) return;
        setMe(meRes.data);
        setCachedMe(meRes.data);
        setAanvragen(aanRes.data ?? []);
        setProjecten(projectRes.items ?? []);
        setProjectenQuota(projectRes.quota ?? null);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(apiErrorMessage(err));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const active = aanvragen.filter(
      (a) => a.status !== "goedgekeurd" && a.status !== "afgewezen",
    ).length;
    const geschat = aanvragen.reduce(
      (sum, a) => sum + Number(a.geschatte_subsidie ?? 0),
      0,
    );
    const missing = aanvragen.reduce(
      (sum, a) => sum + Number(a.missing_document_count ?? 0),
      0,
    );
    const toegekend = aanvragen.reduce(
      (sum, a) => sum + Number(a.toegekende_subsidie ?? 0),
      0,
    );
    return { active, geschat, missing, toegekend };
  }, [aanvragen]);

  const recent = useMemo(() => aanvragen.slice(0, 10), [aanvragen]);

  if (loading) {
    return (
      <div className="container-app flex min-h-[60vh] items-center justify-center py-14">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-greenLight border-t-brand-green" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-10">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      </div>
    );
  }

  const firstName = me?.user?.first_name || "";
  const plan = me?.user?.subscription_plan || "gratis";
  const subStatus = me?.user?.subscription_status || "active";

  return (
    <div className="container-app py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
            {me?.organisation?.name && <span>{me.organisation.name}</span>}
            <PlanBadge plan={plan} status={subStatus} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/subsidiecheck" className="btn-secondary">
            Doe subsidiecheck
          </Link>
          <Link to="/aanvraag/nieuw" className="btn-primary">
            Nieuwe aanvraag
          </Link>
        </div>
      </div>

      {plan === "gratis" && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-green/30 bg-brand-greenLight px-4 py-3 text-sm text-brand-greenDark">
          <span>
            <strong className="font-semibold">U gebruikt het Gratis plan.</strong>{" "}
            Upgrade voor meer projecten en extra functies.
          </span>
          <Link
            to="/onboarding/plan"
            className="font-semibold text-brand-green hover:underline"
          >
            Bekijk plannen →
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Actieve aanvragen"
          value={kpis.active}
          sublabel={`van ${aanvragen.length} totaal`}
        />
        <Kpi
          label="Totaal geschatte subsidie"
          value={formatEuro(kpis.geschat)}
        />
        <Kpi
          label="Documenten te uploaden"
          value={kpis.missing}
          sublabel={
            kpis.missing > 0 ? "U moet nog documenten aanleveren" : "Alles geüpload"
          }
        />
        <Kpi label="Toegekende subsidie" value={formatEuro(kpis.toegekend)} />
      </div>

      <div className="mt-8 rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h2 className="text-lg font-bold text-gray-900">Mijn projecten</h2>
          <div className="flex items-center gap-3 text-sm">
            {projectenQuota && (
              <span className="hidden text-xs text-gray-500 sm:inline">
                {projectenQuota.used}
                {projectenQuota.limit !== null && ` / ${projectenQuota.limit}`} projecten
              </span>
            )}
            <Link
              to="/projecten/nieuw"
              className="font-semibold text-brand-green hover:underline"
            >
              + Project toevoegen
            </Link>
            <Link
              to="/projecten"
              className="font-semibold text-brand-green hover:underline"
            >
              Alles →
            </Link>
          </div>
        </div>

        {projectenQuota &&
          projectenQuota.limit !== null &&
          projectenQuota.remaining !== null &&
          projectenQuota.remaining <= 1 &&
          !projectenQuota.exceeded && (
            <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">
              U heeft nog{" "}
              <strong>
                {projectenQuota.remaining}{" "}
                {projectenQuota.remaining === 1 ? "project" : "projecten"}
              </strong>{" "}
              over in uw huidige plan.{" "}
              <Link
                to="/onboarding/plan"
                className="font-semibold underline hover:text-amber-950"
              >
                Upgrade voor meer projecten →
              </Link>
            </div>
          )}
        {projecten.length === 0 ? (
          <div className="grid place-items-center gap-4 px-5 py-10 text-center">
            <div className="text-5xl" aria-hidden>
              🏠
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                U heeft nog geen projecten
              </h3>
              <p className="mt-1 max-w-md text-sm text-gray-600">
                Voeg uw eerste project toe om maatregelen en subsidiekansen
                per project te registreren.
              </p>
            </div>
            <Link to="/projecten/nieuw" className="btn-primary">
              + Project toevoegen
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {projecten.slice(0, 4).map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <EnergielabelBadge label={p.energielabel_huidig} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-gray-900">
                    {p.straat} {p.huisnummer}, {p.plaats}
                  </div>
                  <div className="text-xs text-gray-500">
                    {projectTypeLabel(p.project_type)} · Bouwjaar {p.bouwjaar} ·{" "}
                    {p.aantal_maatregelen} maatregel
                    {p.aantal_maatregelen === 1 ? "" : "en"}
                  </div>
                </div>
                <DeadlineBadge status={p.worst_deadline_status} />
                <Link
                  to={`/projecten/${p.id}`}
                  className="text-sm font-semibold text-brand-green hover:underline"
                >
                  Bekijken →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-5">
          <h2 className="text-lg font-bold text-gray-900">Recente aanvragen</h2>
        </div>
        {aanvragen.length === 0 ? (
          <div className="grid place-items-center gap-4 px-5 py-12 text-center">
            <div className="text-5xl" aria-hidden>
              📋
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                U heeft nog geen aanvragen
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Start de subsidiecheck om te beginnen. In 5 stappen ziet u
                welke regelingen op uw situatie van toepassing zijn.
              </p>
            </div>
            <Link to="/subsidiecheck" className="btn-primary">
              Start subsidiecheck
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Regeling</th>
                  <th className="px-5 py-3">Maatregel</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Geschatte subsidie</th>
                  <th className="px-5 py-3">Deadline</th>
                  <th className="px-5 py-3 text-right">Actie</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-5 py-3">
                      <RegelingBadge code={a.regeling} />
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {maatregelLabel(a.maatregel)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-900">
                      {formatEuro(a.geschatte_subsidie)}
                    </td>
                    <td className="px-5 py-3">
                      <DeadlineCell datum={a.deadline_datum} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/aanvraag/${a.id}`}
                        className="text-sm font-semibold text-brand-green hover:underline"
                      >
                        Bekijken →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
