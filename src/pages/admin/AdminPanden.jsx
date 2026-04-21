import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  DeadlineBadge,
  EnergielabelBadge,
} from "../../components/panden/PandBadges.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import {
  eigenaarTypeLabel,
  formatDate,
  pandTypeLabel,
} from "../../lib/formatters.js";
import { listPanden } from "../../lib/pandenApi.js";

const DEADLINE_FILTERS = [
  { key: "", label: "Alle" },
  { key: "kritiek", label: "Kritiek" },
  { key: "waarschuwing", label: "Waarschuwing" },
  { key: "ok", label: "Op schema" },
  { key: "verlopen", label: "Verlopen" },
];

export default function AdminPanden() {
  const [panden, setPanden] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    listPanden()
      .then((data) => {
        if (cancelled) return;
        setPanden(data);
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

  const filtered = useMemo(() => {
    if (!filter) return panden;
    return panden.filter((p) => p.deadline_status === filter);
  }, [panden, filter]);

  const kritiek = useMemo(
    () => panden.filter((p) => ["kritiek", "verlopen"].includes(p.deadline_status)),
    [panden],
  );

  return (
    <div className="container-app py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-green">
            Admin
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Panden overzicht
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Alle panden van alle klanten. Filter op deadline-status om
            urgente dossiers als eerste af te handelen.
          </p>
        </div>
        <Link to="/admin/dashboard" className="btn-secondary !py-2 !px-4 text-sm">
          ← Admin dashboard
        </Link>
      </div>

      <KritiekeDeadlinesWidget items={kritiek} />

      <div className="mt-6 flex flex-wrap gap-2">
        {DEADLINE_FILTERS.map((f) => (
          <button
            key={f.key || "alle"}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              filter === f.key
                ? "border-brand-green bg-brand-greenLight text-brand-greenDark"
                : "border-gray-200 bg-white text-gray-700 hover:border-brand-green/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 flex items-center justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-greenLight border-t-brand-green" />
        </div>
      ) : error ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
          Geen panden voor deze filter.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Adres</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Eigenaar</th>
                <th className="px-4 py-3">Bouwjaar</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Maatregelen</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Aangemaakt</th>
                <th className="px-4 py-3 text-right">Actie</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">
                      {p.straat} {p.huisnummer}
                    </div>
                    <div className="text-xs text-gray-500">
                      {p.postcode} {p.plaats}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {pandTypeLabel(p.pand_type)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {eigenaarTypeLabel(p.eigenaar_type)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{p.bouwjaar}</td>
                  <td className="px-4 py-3">
                    <EnergielabelBadge label={p.energielabel_huidig} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.maatregelen_count}
                  </td>
                  <td className="px-4 py-3">
                    <DeadlineBadge status={p.deadline_status} compact />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDate(p.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/panden/${p.id}`}
                      className="text-sm font-semibold text-brand-green hover:underline"
                    >
                      Openen →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KritiekeDeadlinesWidget({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white">
          ⚠
        </span>
        <h2 className="text-base font-bold text-red-900">
          Kritieke deadlines — {items.length}{" "}
          {items.length === 1 ? "pand" : "panden"}
        </h2>
      </div>
      <p className="mt-1 text-sm text-red-800">
        Deze panden hebben maatregelen met een deadline binnen 30 dagen of al
        verlopen. Pak ze als eerste op.
      </p>
      <ul className="mt-3 divide-y divide-red-100 text-sm">
        {items.slice(0, 10).map((p) => (
          <li key={p.id} className="flex items-center justify-between py-2">
            <span className="truncate pr-3">
              <strong className="font-semibold text-gray-900">
                {p.straat} {p.huisnummer}
              </strong>{" "}
              · {p.postcode} {p.plaats}
            </span>
            <Link
              to={`/panden/${p.id}`}
              className="whitespace-nowrap rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
            >
              Pand openen
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
