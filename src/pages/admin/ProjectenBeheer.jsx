import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import DeadlineBadge, {
  EnergielabelBadge,
} from "../../components/projecten/DeadlineBadge.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import {
  eigenaarTypeLabel,
  listProjecten,
  projectTypeLabel,
} from "../../lib/projecten.js";

const STATUS_OPTIONS = [
  { value: "", label: "Alle deadlines" },
  { value: "verlopen", label: "Verlopen" },
  { value: "kritiek", label: "Kritiek (< 30 dagen)" },
  { value: "waarschuwing", label: "Waarschuwing (30–60)" },
  { value: "ok", label: "Op tijd" },
];

export default function ProjectenBeheer() {
  const [state, setState] = useState({ loading: true });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  async function reload() {
    setState({ loading: true });
    try {
      const data = await listProjecten();
      setState({ loading: false, data });
    } catch (e) {
      setState({ loading: false, error: apiErrorMessage(e) });
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    if (!state.data?.items) return [];
    const q = search.trim().toLowerCase();
    return state.data.items.filter((p) => {
      if (
        statusFilter &&
        (p.worst_deadline_status || "ok") !== statusFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        p.straat.toLowerCase().includes(q) ||
        p.plaats.toLowerCase().includes(q) ||
        p.postcode.toLowerCase().includes(q) ||
        (p.organisation_name || "").toLowerCase().includes(q)
      );
    });
  }, [state.data, search, statusFilter]);

  return (
    <div className="container-app py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Projecten beheer
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Alle projecten van alle klanten, inclusief deadlinestatus en
            maatregelen.
          </p>
        </div>
        <Link
          to="/admin/dashboard"
          className="text-sm font-semibold text-brand-green hover:underline"
        >
          ← Terug naar dashboard
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <input
          className="input sm:max-w-sm"
          placeholder="Zoek op klant, adres of plaats"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input sm:max-w-[240px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {state.error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-2">Klant</th>
                <th className="px-4 py-2">Adres</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Eigenaar</th>
                <th className="px-4 py-2">Bouwjaar</th>
                <th className="px-4 py-2">Label</th>
                <th className="px-4 py-2 text-center">Maatregelen</th>
                <th className="px-4 py-2">Deadline</th>
                <th className="px-4 py-2 text-right">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                    Laden…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                    Geen projecten gevonden voor deze filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {p.organisation_name || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {p.straat} {p.huisnummer}
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.postcode} {p.plaats}
                      </div>
                    </td>
                    <td className="px-4 py-3">{projectTypeLabel(p.project_type)}</td>
                    <td className="px-4 py-3">
                      {eigenaarTypeLabel(p.eigenaar_type)}
                    </td>
                    <td className="px-4 py-3">{p.bouwjaar}</td>
                    <td className="px-4 py-3">
                      <EnergielabelBadge label={p.energielabel_huidig} />
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {p.aantal_maatregelen}
                    </td>
                    <td className="px-4 py-3">
                      <DeadlineBadge status={p.worst_deadline_status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/projecten/${p.id}`}
                        className="text-sm font-semibold text-brand-green hover:underline"
                      >
                        Bekijken →
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
