import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import StatusBadge, { RegelingBadge } from "../../components/StatusBadge.jsx";
import api, { apiErrorMessage } from "../../lib/api.js";
import {
  formatDate,
  formatEuro,
  regelingLabel,
  typeAanvragerLabel,
} from "../../lib/formatters.js";

function Kpi({ label, value, accent = "text-gray-900", hint }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-extrabold ${accent}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

function SubscriptionPill({ status, plan }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800 ring-1 ring-inset ring-green-200">
        Actief — {plan === "pro" ? "Pro" : "Starter"}
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 ring-1 ring-inset ring-red-200">
        Geannuleerd
      </span>
    );
  }
  if (status) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-200">
      Geen abonnement
    </span>
  );
}

export default function InstallateurDashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [subError, setSubError] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const statsRes = await api.get("/installateur/stats");
        if (cancel) return;
        setStats(statsRes.data);
        if (statsRes.data?.subscription_status === "active") {
          const [leadsRes, dossiersRes] = await Promise.all([
            api.get("/installateur/leads"),
            api.get("/installateur/dossiers"),
          ]);
          if (cancel) return;
          setLeads(leadsRes.data ?? []);
          setDossiers(dossiersRes.data ?? []);
        } else {
          setLeads([]);
          setDossiers([]);
        }
      } catch (err) {
        if (!cancel) {
          if (err?.response?.status === 402) setSubError(true);
          else setError(apiErrorMessage(err));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, []);

  const noSubscription =
    stats && stats.subscription_status !== "active";

  return (
    <div className="container-app py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Installateur dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Overzicht van uw leads, dossiers en abonnement.
          </p>
        </div>
        <SubscriptionPill
          status={stats?.subscription_status}
          plan={stats?.subscription_plan}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Laden…
        </div>
      )}

      {!loading && (noSubscription || subError) && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="text-lg font-bold text-amber-900">
            U heeft nog geen actief abonnement
          </h2>
          <p className="mt-1 text-sm text-amber-900">
            Activeer uw abonnement om leads te ontvangen en dossiers te
            beheren.
          </p>
          <Link
            to="/installateur/abonnement"
            className="btn-primary mt-4 inline-flex !py-2 !px-4 text-sm"
          >
            Bekijk abonnementen
          </Link>
        </div>
      )}

      {!loading && stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Nieuwe / lopende leads" value={stats.active_leads} />
          <Kpi
            label="Gewonnen leads"
            value={stats.won_leads}
            accent="text-brand-green"
          />
          <Kpi label="Actieve dossiers" value={stats.active_dossiers} />
          <Kpi
            label="Abonnement"
            value={
              stats.subscription_status === "active"
                ? stats.subscription_plan === "pro"
                  ? "Pro"
                  : "Starter"
                : "—"
            }
            hint={
              stats.subscription_status === "active"
                ? "Actief"
                : stats.subscription_status || "Niet actief"
            }
          />
        </div>
      )}

      {!loading && stats?.subscription_status === "active" && (
        <>
          <div className="mb-6 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-bold text-gray-900">
                Recente leads
              </h2>
              <Link
                to="/installateur/leads"
                className="text-sm font-semibold text-brand-green hover:underline"
              >
                Alle leads →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-2">Regeling</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Postcode</th>
                    <th className="px-4 py-2">Investering</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        Nog geen leads in uw regio.
                      </td>
                    </tr>
                  )}
                  {leads.slice(0, 5).map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-4 py-3">
                        <RegelingBadge code={lead.aanvraag.regeling} />
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {typeAanvragerLabel(lead.aanvraag.type_aanvrager)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {lead.aanvraag.postcode || "—"}{" "}
                        {lead.aanvraag.plaats && (
                          <span className="text-gray-500">
                            ({lead.aanvraag.plaats})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatEuro(lead.aanvraag.investering_bedrag)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-bold text-gray-900">
                Recente dossiers
              </h2>
              <Link
                to="/installateur/dossiers"
                className="text-sm font-semibold text-brand-green hover:underline"
              >
                Alle dossiers →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-2">Klant</th>
                    <th className="px-4 py-2">Regeling</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Subsidie</th>
                    <th className="px-4 py-2">Deadline</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dossiers.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-gray-500"
                      >
                        Nog geen actieve dossiers.
                      </td>
                    </tr>
                  )}
                  {dossiers.slice(0, 5).map((d) => (
                    <tr key={d.id}>
                      <td className="px-4 py-3 text-gray-700">
                        {d.aanvrager_name || d.organisation_name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <RegelingBadge code={d.regeling} />{" "}
                        <span className="text-xs text-gray-500">
                          {regelingLabel(d.regeling)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatEuro(
                          d.toegekende_subsidie ?? d.geschatte_subsidie,
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatDate(d.deadline_datum)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/installateur/dossier/${d.id}`}
                          className="text-sm font-semibold text-brand-green hover:underline"
                        >
                          Bekijk →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
