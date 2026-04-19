import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import StatusBadge, { RegelingBadge } from "../components/StatusBadge.jsx";
import { api, apiErrorMessage } from "../lib/api.js";
import { setCachedMe } from "../lib/auth.js";
import {
  formatDate,
  formatEuro,
  daysUntil,
  maatregelLabel,
} from "../lib/formatters.js";

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "Goedenacht";
  if (h < 12) return "Goedemorgen";
  if (h < 18) return "Goedemiddag";
  return "Goedenavond";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.get("/auth/me"), api.get("/aanvragen")])
      .then(([meRes, aanRes]) => {
        if (cancelled) return;
        setMe(meRes.data);
        setCachedMe(meRes.data);
        setAanvragen(aanRes.data ?? []);
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

  return (
    <div className="container-app py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          {me?.organisation?.name && (
            <p className="mt-1 text-sm text-gray-600">
              {me.organisation.name}
            </p>
          )}
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
