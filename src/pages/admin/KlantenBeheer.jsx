import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api, { apiErrorMessage } from "../../lib/api.js";
import { formatDate, formatEuro } from "../../lib/formatters.js";

export default function KlantenBeheer() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/admin/klanten");
        if (!cancel) setItems(res.data);
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

  return (
    <div className="container-app py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Klantenbeheer
        </h1>
        <p className="text-sm text-gray-600">
          Overzicht van klantorganisaties en hun aanvragen.
        </p>
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
                <th className="px-4 py-2">Organisatie</th>
                <th className="px-4 py-2">Contactpersoon</th>
                <th className="px-4 py-2 text-right">Aanvragen</th>
                <th className="px-4 py-2 text-right">Geschat</th>
                <th className="px-4 py-2 text-right">Toegekend</th>
                <th className="px-4 py-2">Aangemaakt</th>
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
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Nog geen klanten geregistreerd.
                  </td>
                </tr>
              ) : (
                items.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">
                        {k.name}
                      </div>
                      {k.kvk_number && (
                        <div className="text-xs text-gray-500">
                          KvK {k.kvk_number}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {k.primary_contact_name && (
                        <div className="font-medium text-gray-800">
                          {k.primary_contact_name}
                        </div>
                      )}
                      <div className="text-gray-500">
                        {k.primary_contact_email ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {k.aanvraag_count}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {formatEuro(k.totaal_geschatte_subsidie)}
                    </td>
                    <td className="px-4 py-3 text-right text-brand-green">
                      {formatEuro(k.totaal_toegekende_subsidie)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(k.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/aanvragen?organisation_id=${k.id}`}
                        className="text-sm font-semibold text-brand-green hover:underline"
                      >
                        Aanvragen →
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
