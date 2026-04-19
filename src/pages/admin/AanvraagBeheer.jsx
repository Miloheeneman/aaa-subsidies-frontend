import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import StatusBadge, { RegelingBadge } from "../../components/StatusBadge.jsx";
import api, { apiErrorMessage } from "../../lib/api.js";
import {
  daysUntil,
  formatDate,
  formatEuro,
  maatregelLabel,
  typeAanvragerLabel,
} from "../../lib/formatters.js";

const STATUS_OPTIONS = [
  { value: "", label: "Alle statussen" },
  { value: "intake", label: "Intake" },
  { value: "documenten", label: "Documenten" },
  { value: "review", label: "Review" },
  { value: "ingediend", label: "Ingediend" },
  { value: "goedgekeurd", label: "Goedgekeurd" },
  { value: "afgewezen", label: "Afgewezen" },
];
const REGELING_OPTIONS = [
  { value: "", label: "Alle regelingen" },
  { value: "ISDE", label: "ISDE" },
  { value: "EIA", label: "EIA" },
  { value: "MIA", label: "MIA" },
  { value: "VAMIL", label: "Vamil" },
  { value: "DUMAVA", label: "DUMAVA" },
];
const QUICK_STATUS = STATUS_OPTIONS.filter((o) => o.value !== "");

export default function AanvraagBeheer() {
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRegeling, setFilterRegeling] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [data, setData] = useState({
    items: [],
    total: 0,
    page: 1,
    per_page: 20,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingStatusId, setPendingStatusId] = useState(null);

  const queryParams = useMemo(
    () => ({
      page,
      per_page: perPage,
      status: filterStatus || undefined,
      regeling: filterRegeling || undefined,
    }),
    [page, perPage, filterStatus, filterRegeling]
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/aanvragen", { params: queryParams });
      setData(res.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams.page, queryParams.status, queryParams.regeling]);

  async function quickStatus(item, newStatus) {
    if (newStatus === item.status) return;
    if (newStatus === "goedgekeurd" || newStatus === "afgewezen") {
      window.alert(
        "Goedkeuren of afwijzen kan alleen vanuit het aanvraagdetail (bedrag of reden vereist)."
      );
      return;
    }
    setPendingStatusId(item.id);
    try {
      await api.patch(`/admin/aanvragen/${item.id}/status`, {
        status: newStatus,
      });
      await load();
    } catch (err) {
      window.alert(apiErrorMessage(err));
    } finally {
      setPendingStatusId(null);
    }
  }

  return (
    <div className="container-app py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Aanvragenbeheer
          </h1>
          <p className="text-sm text-gray-600">
            Filter, beoordeel en open elke subsidieaanvraag.
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Regeling
          </label>
          <select
            value={filterRegeling}
            onChange={(e) => {
              setFilterRegeling(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {REGELING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto text-sm text-gray-600">
          Totaal: <strong>{data.total}</strong>
        </div>
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
                <th className="px-4 py-2">Regeling</th>
                <th className="px-4 py-2">Type / maatregel</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Investering</th>
                <th className="px-4 py-2 text-right">Subsidie</th>
                <th className="px-4 py-2">Deadline</th>
                <th className="px-4 py-2">Snel</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Laden…
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Geen aanvragen gevonden.
                  </td>
                </tr>
              ) : (
                data.items.map((it) => {
                  const dl = daysUntil(it.deadline_datum);
                  return (
                    <tr key={it.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">
                          {it.organisation_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {it.aanvrager_name} · {it.aanvrager_email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RegelingBadge code={it.regeling} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        <div>{typeAanvragerLabel(it.type_aanvrager)}</div>
                        <div className="text-gray-400">
                          {maatregelLabel(it.maatregel)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={it.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatEuro(it.investering_bedrag)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatEuro(
                          it.toegekende_subsidie ?? it.geschatte_subsidie
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {it.deadline_datum ? (
                          <>
                            <div>{formatDate(it.deadline_datum)}</div>
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
                                  ? `${Math.abs(dl)} dgn verlopen`
                                  : `Nog ${dl} dgn`}
                            </div>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          disabled={pendingStatusId === it.id}
                          value={it.status}
                          onChange={(e) => quickStatus(it, e.target.value)}
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                        >
                          {QUICK_STATUS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/aanvraag/${it.id}`}
                          className="text-sm font-semibold text-brand-green hover:underline"
                        >
                          Detail →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {data.pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm">
            <div className="text-gray-600">
              Pagina {data.page} van {data.pages}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 disabled:opacity-50"
              >
                ← Vorige
              </button>
              <button
                type="button"
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 disabled:opacity-50"
              >
                Volgende →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
