import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DeadlineBadge from "../../components/projecten/DeadlineBadge.jsx";
import { RegelingBadge } from "../../components/StatusBadge.jsx";
import api, { apiErrorMessage } from "../../lib/api.js";
import { formatDate } from "../../lib/formatters.js";
import { maatregelStatusLabel } from "../../lib/projecten.js";

const STATUS_FILTERS = [
  { value: "", label: "Alle statussen" },
  { value: "orientatie", label: "Nieuw" },
  { value: "gepland", label: "Gepland" },
  { value: "uitgevoerd", label: "Uitgevoerd" },
  { value: "aangevraagd", label: "Aangevraagd" },
  { value: "in_beoordeling", label: "In beoordeling" },
  { value: "goedgekeurd", label: "Goedgekeurd" },
  { value: "afgewezen", label: "Afgewezen" },
];

const REGELING_FILTERS = [
  { value: "", label: "Alle regelingen" },
  { value: "ISDE", label: "ISDE" },
  { value: "EIA", label: "EIA" },
  { value: "MIA", label: "MIA" },
  { value: "VAMIL", label: "VAMIL" },
  { value: "DUMAVA", label: "DUMAVA" },
];

const DEADLINE_FILTERS = [
  { value: "", label: "Alle deadlines" },
  { value: "ok", label: "OK" },
  { value: "waarschuwing", label: "Waarschuwing" },
  { value: "kritiek", label: "Kritiek" },
  { value: "verlopen", label: "Verlopen" },
];

const JAAR_OPTS = ["", "2024", "2025", "2026"];

const SORT_OPTS = [
  { value: "updated", label: "Laatst bijgewerkt" },
  { value: "deadline", label: "Deadline" },
  { value: "aangemaakt", label: "Aangemaakt" },
  { value: "klant", label: "Klant" },
  { value: "adres", label: "Postcode" },
  { value: "regeling", label: "Regeling" },
  { value: "status", label: "Status" },
];

export default function AdminMaatregelenLijst({ mode }) {
  const isDossiers = mode === "dossiers";
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoek, setZoek] = useState("");
  const [jaar, setJaar] = useState("");
  const [regeling, setRegeling] = useState("");
  const [status, setStatus] = useState("");
  const [deadlineStatus, setDeadlineStatus] = useState("");
  const [klantNaam, setKlantNaam] = useState("");
  const [quick, setQuick] = useState("");
  const [sort, setSort] = useState("updated");
  const [order, setOrder] = useState("desc");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/dossiers", {
        params: {
          page,
          per_page: 40,
          zoek: zoek.trim() || undefined,
          jaar: jaar || undefined,
          regeling: regeling || undefined,
          status: status || undefined,
          deadline_status: deadlineStatus || undefined,
          klant_naam: klantNaam.trim() || undefined,
          quick: quick || undefined,
          sort,
          order,
        },
      });
      setData(res.data);
      setError(null);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [
    page,
    zoek,
    jaar,
    regeling,
    status,
    deadlineStatus,
    klantNaam,
    quick,
    sort,
    order,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  async function exportCsv() {
    try {
      const res = await api.get("/admin/export/projecten", {
        params: {
          jaar: jaar || undefined,
          regeling: regeling || undefined,
          status: status || undefined,
          deadline_status: deadlineStatus || undefined,
          zoek: zoek.trim() || undefined,
        },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "projecten_export.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(apiErrorMessage(e, "Export mislukt"));
    }
  }

  const items = data?.items ?? [];

  return (
    <div className="container-app py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {isDossiers ? "Dossiers" : "Projecten & dossiers"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isDossiers
              ? "Maatregelen per dossier, inclusief ontbrekende documenten."
              : "Overzicht per maatregel; export als CSV."}
          </p>
        </div>
        {!isDossiers && (
          <button
            type="button"
            onClick={exportCsv}
            className="btn-secondary !py-2 !px-4 text-sm"
          >
            Exporteer als CSV
          </button>
        )}
      </div>

      {isDossiers && (
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { q: "", l: "Alle" },
            { q: "actie", l: "Actie vereist" },
            { q: "review", l: "In review" },
            { q: "ingediend", l: "Ingediend" },
            { q: "goedgekeurd", l: "Goedgekeurd" },
          ].map((b) => (
            <button
              key={b.q || "all"}
              type="button"
              onClick={() => {
                setQuick(b.q);
                setPage(1);
              }}
              className={
                quick === b.q
                  ? "rounded-full bg-brand-green px-4 py-1.5 text-xs font-bold text-white"
                  : "rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 hover:border-brand-green"
              }
            >
              {b.l}
            </button>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-4">
        <input
          className="input min-w-[200px] flex-1 sm:max-w-xs"
          placeholder="Adres, postcode of klant"
          value={zoek}
          onChange={(e) => {
            setZoek(e.target.value);
            setPage(1);
          }}
        />
        <input
          className="input min-w-[160px] sm:max-w-[200px]"
          placeholder="Klantnaam"
          value={klantNaam}
          onChange={(e) => {
            setKlantNaam(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="input sm:max-w-[120px]"
          value={jaar}
          onChange={(e) => {
            setJaar(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Jaar</option>
          {JAAR_OPTS.filter(Boolean).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          className="input sm:max-w-[140px]"
          value={regeling}
          onChange={(e) => {
            setRegeling(e.target.value);
            setPage(1);
          }}
        >
          {REGELING_FILTERS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className="input sm:max-w-[160px]"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          {STATUS_FILTERS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className="input sm:max-w-[160px]"
          value={deadlineStatus}
          onChange={(e) => {
            setDeadlineStatus(e.target.value);
            setPage(1);
          }}
        >
          {DEADLINE_FILTERS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className="input sm:max-w-[200px]"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          {SORT_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              Sorteer: {o.label}
            </option>
          ))}
        </select>
        <select
          className="input sm:max-w-[120px]"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        >
          <option value="desc">Aflopend</option>
          <option value="asc">Oplopend</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">Klant</th>
                <th className="px-3 py-2">Project</th>
                <th className="px-3 py-2">Subsidie</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Deadline</th>
                <th className="px-3 py-2 text-center">Docs</th>
                {isDossiers && (
                  <th className="px-3 py-2 text-center">Missend</th>
                )}
                <th className="px-3 py-2">Aangemaakt</th>
                <th className="px-3 py-2 text-right">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={isDossiers ? 9 : 8}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Laden…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={isDossiers ? 9 : 8}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Geen resultaten.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.maatregel_id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {row.organisation_name}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{row.project_adres}</td>
                    <td className="px-3 py-2">
                      {row.regeling ? (
                        <RegelingBadge code={row.regeling} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {maatregelStatusLabel(row.status)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs">
                        {row.deadline_indienen
                          ? formatDate(row.deadline_indienen)
                          : "—"}
                      </div>
                      {row.deadline_status && (
                        <DeadlineBadge status={row.deadline_status} />
                      )}
                    </td>
                    <td className="px-3 py-2 text-center text-xs">
                      {row.verplicht_docs_geupload}/{row.verplicht_docs_totaal}
                    </td>
                    {isDossiers && (
                      <td
                        className={`px-3 py-2 text-center text-xs font-semibold ${
                          row.missende_verplicht > 0
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {row.missende_verplicht}
                      </td>
                    )}
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        to={`/admin/projecten/${row.project_id}/maatregelen/${row.maatregel_id}`}
                        className="font-semibold text-brand-green hover:underline"
                      >
                        Bekijk →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.pages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-secondary !py-1 !px-3 text-sm disabled:opacity-40"
          >
            Vorige
          </button>
          <span className="self-center text-sm text-gray-600">
            Pagina {page} / {data.pages}
          </span>
          <button
            type="button"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary !py-1 !px-3 text-sm disabled:opacity-40"
          >
            Volgende
          </button>
        </div>
      )}
    </div>
  );
}
