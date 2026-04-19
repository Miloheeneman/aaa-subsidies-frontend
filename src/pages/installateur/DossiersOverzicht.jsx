import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import StatusBadge, { RegelingBadge } from "../../components/StatusBadge.jsx";
import api, { apiErrorMessage } from "../../lib/api.js";
import {
  formatDate,
  formatEuro,
  regelingLabel,
} from "../../lib/formatters.js";

export default function DossiersOverzicht() {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/installateur/dossiers");
        if (!cancel) setDossiers(res.data ?? []);
      } catch (err) {
        if (!cancel) {
          if (err?.response?.status === 402) setLocked(true);
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

  return (
    <div className="container-app py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Dossiers</h1>
        <p className="text-sm text-gray-600">
          Aanvragen waar u als installateur op bent toegewezen.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {locked && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="text-lg font-bold text-amber-900">
            Activeer uw abonnement
          </h2>
          <p className="mt-1 text-sm text-amber-900">
            Dossiers zijn alleen zichtbaar voor installateurs met een actief
            abonnement.
          </p>
          <Link
            to="/installateur/abonnement"
            className="btn-primary mt-4 inline-flex !py-2 !px-4 text-sm"
          >
            Bekijk abonnementen
          </Link>
        </div>
      )}

      {!locked && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-2">Klant</th>
                  <th className="px-4 py-2">Regeling</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Investering</th>
                  <th className="px-4 py-2">Subsidie</th>
                  <th className="px-4 py-2">Deadline</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Laden…
                    </td>
                  </tr>
                )}
                {!loading && dossiers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Nog geen dossiers. Accepteer leads om hier dossiers
                      toegevoegd te zien.
                    </td>
                  </tr>
                )}
                {!loading &&
                  dossiers.map((d) => (
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
                        {formatEuro(d.investering_bedrag)}
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
      )}
    </div>
  );
}
