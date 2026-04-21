import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiErrorMessage } from "../../lib/api.js";
import { formatDate, daysUntil } from "../../lib/formatters.js";
import {
  kritiekeDeadlines,
  maatregelLabel,
} from "../../lib/panden.js";
import DeadlineBadge from "./DeadlineBadge.jsx";

/**
 * Admin-only widget: maatregelen met een deadline binnen 30 dagen.
 * Rood als < 14 dagen. Leeg state = "geen urgente deadlines".
 */
export default function KritiekeDeadlinesWidget({ maxDagen = 30, limit = 10 }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    kritiekeDeadlines(maxDagen)
      .then((data) => !cancelled && setItems(data))
      .catch((e) => !cancelled && setError(apiErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [maxDagen]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Kritieke deadlines (≤ {maxDagen} dagen)
        </h3>
        <Link
          to="/admin/panden"
          className="text-xs font-semibold text-brand-green hover:underline"
        >
          Alle panden →
        </Link>
      </div>

      {loading && (
        <div className="py-6 text-sm text-gray-500">Laden…</div>
      )}
      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="py-6 text-sm text-gray-500">
          Geen urgente deadlines binnen deze termijn.
        </p>
      )}
      {!loading && items.length > 0 && (
        <ul className="mt-3 divide-y divide-gray-100 text-sm">
          {items.slice(0, limit).map((m) => {
            const dagen = daysUntil(m.deadline_indienen);
            const rood = dagen !== null && dagen < 14;
            return (
              <li
                key={m.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-gray-900">
                    {maatregelLabel(m.maatregel_type)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Indienen vóór {formatDate(m.deadline_indienen)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {rood && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-red-800">
                      &lt; 14 dgn
                    </span>
                  )}
                  <DeadlineBadge
                    status={m.deadline_status}
                    datum={m.deadline_indienen}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
