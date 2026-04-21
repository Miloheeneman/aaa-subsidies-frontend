import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import StatusBadge, { RegelingBadge } from "../../components/StatusBadge.jsx";
import KritiekeDeadlinesWidget from "../../components/panden/KritiekeDeadlinesWidget.jsx";
import api, { apiErrorMessage } from "../../lib/api.js";
import {
  daysUntil,
  formatDate,
  formatEuro,
  regelingLabel,
} from "../../lib/formatters.js";

const STATUS_KEYS = [
  "intake",
  "documenten",
  "review",
  "ingediend",
  "goedgekeurd",
  "afgewezen",
];
const REGELING_KEYS = ["ISDE", "EIA", "MIA", "VAMIL", "DUMAVA"];

const STATUS_BAR_COLORS = {
  intake: "bg-gray-400",
  documenten: "bg-blue-500",
  review: "bg-amber-500",
  ingediend: "bg-purple-500",
  goedgekeurd: "bg-brand-green",
  afgewezen: "bg-red-500",
};

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

export default function AdminDashboard() {
  const [dash, setDash] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true);
      try {
        const [dashRes, listRes] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/aanvragen", { params: { page: 1, per_page: 10 } }),
        ]);
        if (cancel) return;
        setDash(dashRes.data);
        setRecent(listRes.data.items ?? []);
      } catch (err) {
        if (!cancel) setError(apiErrorMessage(err));
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => {
      cancel = true;
    };
  }, []);

  const maxStatus = dash
    ? Math.max(1, ...STATUS_KEYS.map((k) => dash.per_status[k] ?? 0))
    : 1;
  const maxRegeling = dash
    ? Math.max(1, ...REGELING_KEYS.map((k) => dash.per_regeling[k] ?? 0))
    : 1;

  return (
    <div className="container-app py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Admin dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Realtime overzicht van alle subsidieaanvragen, fees en deadlines.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/aanvragen" className="btn-secondary !py-2 !px-4 text-sm">
            Alle aanvragen
          </Link>
          <Link to="/admin/panden" className="btn-secondary !py-2 !px-4 text-sm">
            Panden
          </Link>
          <Link to="/admin/klanten" className="btn-primary !py-2 !px-4 text-sm">
            Klanten
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading || !dash ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          Laden…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Kpi label="Totaal aanvragen" value={dash.totaal_aanvragen} />
            <Kpi label="Deze maand" value={dash.aanvragen_deze_maand} />
            <Kpi
              label="Geschatte subsidie"
              value={formatEuro(dash.totaal_geschatte_subsidie)}
            />
            <Kpi
              label="Toegekende subsidie"
              value={formatEuro(dash.totaal_toegekende_subsidie)}
              accent="text-brand-green"
            />
            <Kpi
              label="Totale AAA-Lex fee"
              value={formatEuro(dash.totaal_aaa_lex_fee)}
            />
            <Kpi
              label="Verlopen deadlines"
              value={dash.deadlines_verlopen}
              accent={dash.deadlines_verlopen > 0 ? "text-red-600" : "text-gray-900"}
              hint={`Komend (≤ 14 dgn): ${dash.deadlines_binnen_14_dagen}`}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 text-sm font-semibold text-gray-700">
                Aanvragen per status
              </div>
              <div className="space-y-2">
                {STATUS_KEYS.map((s) => {
                  const v = dash.per_status[s] ?? 0;
                  const pct = Math.round((v / maxStatus) * 100);
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div className="w-32 text-xs">
                        <StatusBadge status={s} />
                      </div>
                      <div className="flex-1 rounded-full bg-gray-100">
                        <div
                          className={`h-2 rounded-full ${STATUS_BAR_COLORS[s]}`}
                          style={{ width: `${Math.max(pct, v > 0 ? 6 : 0)}%` }}
                        />
                      </div>
                      <div className="w-8 text-right text-sm font-semibold text-gray-700">
                        {v}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-3 text-sm font-semibold text-gray-700">
                Aanvragen per regeling
              </div>
              <div className="space-y-2">
                {REGELING_KEYS.map((r) => {
                  const v = dash.per_regeling[r] ?? 0;
                  const pct = Math.round((v / maxRegeling) * 100);
                  return (
                    <div key={r} className="flex items-center gap-3">
                      <div className="w-24">
                        <RegelingBadge code={r} />
                      </div>
                      <div className="flex-1 rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-brand-green"
                          style={{ width: `${Math.max(pct, v > 0 ? 6 : 0)}%` }}
                        />
                      </div>
                      <div className="w-8 text-right text-sm font-semibold text-gray-700">
                        {v}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <KritiekeDeadlinesWidget maxDagen={30} limit={8} />
          </div>

          <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
              <div className="text-sm font-semibold text-gray-700">
                Recente aanvragen
              </div>
              <Link
                to="/admin/aanvragen"
                className="text-xs font-semibold text-brand-green hover:underline"
              >
                Alles bekijken →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-2">Klant</th>
                    <th className="px-4 py-2">Regeling</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 text-right">Subsidie</th>
                    <th className="px-4 py-2">Deadline</th>
                    <th className="px-4 py-2">Actie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recent.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Nog geen aanvragen.
                      </td>
                    </tr>
                  ) : (
                    recent.map((a) => {
                      const dl = daysUntil(a.deadline_datum);
                      return (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">
                              {a.organisation_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {a.aanvrager_email}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <RegelingBadge code={a.regeling} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={a.status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatEuro(
                              a.toegekende_subsidie ?? a.geschatte_subsidie
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {a.deadline_datum ? (
                              <>
                                <div>{formatDate(a.deadline_datum)}</div>
                                <div
                                  className={
                                    dl !== null && dl < 0
                                      ? "text-red-600"
                                      : dl !== null && dl <= 14
                                        ? "text-amber-600"
                                        : "text-gray-500"
                                  }
                                >
                                  {dl === null
                                    ? ""
                                    : dl < 0
                                      ? `${Math.abs(dl)} dagen verlopen`
                                      : `Nog ${dl} dagen`}
                                </div>
                              </>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              to={`/admin/aanvraag/${a.id}`}
                              className="text-sm font-semibold text-brand-green hover:underline"
                            >
                              Bekijken
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-2 text-right text-xs text-gray-400">
            {regelingLabel("ISDE")} · {regelingLabel("EIA")} · {regelingLabel("MIA")} · {regelingLabel("VAMIL")} · {regelingLabel("DUMAVA")}
          </div>
        </>
      )}
    </div>
  );
}
