import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api, apiErrorMessage } from "../lib/api.js";
import { setCachedMe } from "../lib/auth.js";
import {
  formatDate,
  formatEuro,
} from "../lib/formatters.js";
import {
  listNotifications,
  listProjecten,
} from "../lib/projecten.js";

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

function OnboardingEmpty({ firstName }) {
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-brand-green/25 bg-gradient-to-br from-brand-greenLight to-white shadow-sm">
      <div className="border-b border-brand-green/20 bg-white/80 px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-brand-greenDark">
        Stap 1 van 3
      </div>
      <div className="px-6 py-10 text-center sm:px-10">
        <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
          Welkom bij AAA-Subsidies
          {firstName ? `, ${firstName}` : ""}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-gray-600">
          In 3 stappen starten wij uw subsidietraject — rustig, overzichtelijk en
          met AAA-Lex naast u.
        </p>
        <ol className="mx-auto mt-8 max-w-md space-y-4 text-left text-sm">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-brand-green text-xs font-extrabold text-white">
              ✓
            </span>
            <div>
              <div className="font-bold text-gray-900">Account aangemaakt</div>
              <div className="text-gray-600">U bent ingelogd en klaar om te starten.</div>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 border-brand-green bg-white text-xs font-extrabold text-brand-green">
              →
            </span>
            <div>
              <div className="font-bold text-gray-900">Project registreren</div>
              <div className="text-gray-600">
                Voeg uw eerste project toe zodat wij kunnen berekenen welke
                subsidies van toepassing zijn.
              </div>
              <Link to="/projecten/nieuw" className="btn-primary mt-3 inline-flex">
                Project toevoegen
              </Link>
            </div>
          </li>
          <li className="flex gap-3 opacity-70">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-gray-300 bg-gray-50 text-xs font-bold text-gray-400">
              ○
            </span>
            <div>
              <div className="font-bold text-gray-900">Aanvraag starten</div>
              <div className="text-gray-600">
                Kies een maatregel en doorloop de wizard — AAA-Lex begeleidt het
                dossier verder.
              </div>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [projecten, setProjecten] = useState([]);
  const [projectenQuota, setProjectenQuota] = useState(null);
  const [notifs, setNotifs] = useState({ items: [], unread_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get("/auth/me"),
      listProjecten().catch(() => ({ items: [], quota: null })),
      listNotifications().catch(() => ({ items: [], unread_count: 0 })),
    ])
      .then(([meRes, projectRes, notifRes]) => {
        if (cancelled) return;
        setMe(meRes.data);
        setCachedMe(meRes.data);
        setProjecten(projectRes.items ?? []);
        setProjectenQuota(projectRes.quota ?? null);
        setNotifs(notifRes);
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
    const active = projecten.length;
    const geschat = projecten.reduce(
      (sum, p) => sum + Number(p.totaal_geschatte_subsidie ?? 0),
      0,
    );
    const uploads = projecten.filter((p) => p.heeft_open_upload_verzoek).length;
    const openActions =
      uploads + (notifs.items || []).filter((n) => !n.read_at).length;
    return { active, geschat, openActions };
  }, [projecten, notifs.items]);

  const activity = useMemo(() => {
    const rows = [];
    for (const n of notifs.items || []) {
      rows.push({
        key: `n-${n.id}`,
        label: n.title,
        sub: n.body,
        at: n.created_at,
        href: `/projecten/${n.project_id}`,
      });
    }
    for (const p of projecten.slice(0, 5)) {
      rows.push({
        key: `p-${p.id}`,
        label: `Project: ${p.straat} ${p.huisnummer}, ${p.plaats}`,
        sub: p.heeft_open_upload_verzoek
          ? "Actie: documenten uploaden"
          : `${p.aantal_maatregelen || 0} maatregel(len)`,
        at: p.updated_at || p.created_at,
        href: `/projecten/${p.id}`,
      });
    }
    rows.sort((a, b) => new Date(b.at) - new Date(a.at));
    return rows.slice(0, 12);
  }, [notifs.items, projecten]);

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
  const isKlant = me?.user?.role === "klant";
  const noProjects = isKlant && projecten.length === 0;

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
          <Link to="/projecten/nieuw" className="btn-primary">
            Project toevoegen
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

      {noProjects ? (
        <OnboardingEmpty firstName={firstName} />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Kpi label="Actieve projecten" value={kpis.active} />
          <Kpi
            label="Totaal geschatte subsidie"
            value={formatEuro(kpis.geschat)}
            sublabel="Som van alle maatregelen op uw projecten"
          />
          <Kpi
            label="Openstaande acties"
            value={kpis.openActions}
            sublabel="Meldingen + openstaande document-uploads"
          />
        </div>
      )}

      {!noProjects && (
        <>
          <div className="mt-8 rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-900">Mijn projecten</h2>
              <div className="flex items-center gap-3 text-sm">
                {projectenQuota && (
                  <span className="hidden text-xs text-gray-500 sm:inline">
                    {projectenQuota.used}
                    {projectenQuota.limit !== null && ` / ${projectenQuota.limit}`}{" "}
                    projecten
                  </span>
                )}
                <Link
                  to="/projecten/nieuw"
                  className="font-semibold text-brand-green hover:underline"
                >
                  + Nieuw
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
            <ul className="divide-y divide-gray-100">
              {projecten.slice(0, 6).map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-4 px-5 py-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-gray-900">
                      {p.straat} {p.huisnummer}, {p.plaats}
                    </div>
                    <div className="text-xs text-gray-500">
                      {p.aantal_maatregelen || 0} maatregel(en) · geschat{" "}
                      {formatEuro(p.totaal_geschatte_subsidie || 0)}
                      {p.heeft_open_upload_verzoek && (
                        <span className="ml-2 font-semibold text-amber-700">
                          · documenten nodig
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/projecten/${p.id}`}
                    className="text-sm font-semibold text-brand-green hover:underline"
                  >
                    Openen →
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5">
              <h2 className="text-lg font-bold text-gray-900">Recente activiteit</h2>
              <p className="mt-1 text-xs text-gray-500">
                Statusupdates, documentverzoeken en uw projecten.
              </p>
            </div>
            {activity.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-500">
                Nog geen activiteit om te tonen.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {activity.map((row) => (
                  <li key={row.key}>
                    <Link
                      to={row.href}
                      className="flex flex-col gap-0.5 px-5 py-3 text-sm hover:bg-gray-50"
                    >
                      <span className="font-semibold text-gray-900">
                        {row.label}
                      </span>
                      {row.sub && (
                        <span className="line-clamp-2 text-xs text-gray-600">
                          {row.sub}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">
                        {formatDate(row.at)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
