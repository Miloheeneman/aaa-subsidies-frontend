import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api, { apiErrorMessage } from "../../lib/api.js";
import { formatDate } from "../../lib/formatters.js";

function PlanBadge({ plan }) {
  const p = (plan || "gratis").toLowerCase();
  const cls =
    p === "pro"
      ? "bg-purple-100 text-purple-800"
      : p === "starter"
        ? "bg-amber-100 text-amber-900"
        : "bg-gray-100 text-gray-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${cls}`}>
      {p}
    </span>
  );
}

export default function KlantenBeheer() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancel = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get("/admin/klanten", {
          params: { q: q.trim() || undefined },
        });
        if (!cancel) {
          setItems(res.data);
          setError(null);
        }
      } catch (err) {
        if (!cancel) setError(apiErrorMessage(err));
      } finally {
        if (!cancel) setLoading(false);
      }
    }, 300);
    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [q]);

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) =>
        String(a.name).localeCompare(String(b.name), "nl"),
      ),
    [items],
  );

  return (
    <div className="container-app py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Klanten</h1>
        <p className="text-sm text-gray-600">
          Zoek op naam of e-mail. Klik op een klant voor het volledige dossier.
        </p>
      </div>

      <div className="mb-4">
        <input
          className="input max-w-md"
          placeholder="Zoek op organisatie of e-mail…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-2">Klant</th>
                <th className="px-4 py-2">E-mail</th>
                <th className="px-4 py-2 text-right">Projecten</th>
                <th className="px-4 py-2 text-right">Actieve dossiers</th>
                <th className="px-4 py-2">Lid sinds</th>
                <th className="px-4 py-2">Abonnement</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Laden…
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Geen klanten gevonden.
                  </td>
                </tr>
              ) : (
                sorted.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/klanten/${k.id}`}
                        className="font-semibold text-brand-green hover:underline"
                      >
                        {k.name}
                      </Link>
                      {k.kvk_number && (
                        <div className="text-xs text-gray-500">KvK {k.kvk_number}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {k.primary_contact_email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {k.project_count ?? 0}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        (k.critical_maatregel_count ?? 0) > 0
                          ? "text-red-600"
                          : "text-gray-800"
                      }`}
                    >
                      {k.active_maatregel_count ?? 0}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(k.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge plan={k.subscription_plan} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/klanten/${k.id}`}
                        className="text-sm font-semibold text-brand-green hover:underline"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
