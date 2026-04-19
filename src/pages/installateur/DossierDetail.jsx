import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import StatusBadge, { RegelingBadge } from "../../components/StatusBadge.jsx";
import api, { apiErrorMessage } from "../../lib/api.js";
import {
  daysUntil,
  formatDate,
  formatEuro,
  maatregelLabel,
  regelingLabel,
  typeAanvragerLabel,
} from "../../lib/formatters.js";

function DeadlineBanner({ datum }) {
  if (!datum) return null;
  const days = daysUntil(datum);
  if (days === null) return null;
  if (days < 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <strong>Deadline verlopen:</strong> {formatDate(datum)} ({Math.abs(days)} dagen geleden).
      </div>
    );
  }
  if (days <= 14) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Deadline nadert:</strong> nog {days} dagen tot {formatDate(datum)}.
      </div>
    );
  }
  return null;
}

function StatusTimeline({ events }) {
  if (!events?.length) return null;
  return (
    <ol className="relative border-l-2 border-gray-200 pl-6">
      {events.map((e, i) => (
        <li key={`${e.status}-${i}`} className="mb-6 last:mb-0">
          <span
            className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
              e.current
                ? e.status === "afgewezen"
                  ? "bg-red-500"
                  : "bg-brand-green"
                : e.reached
                  ? "bg-brand-green"
                  : "bg-gray-300"
            }`}
            aria-hidden
          />
          <div
            className={`text-sm font-semibold ${
              e.current
                ? e.status === "afgewezen"
                  ? "text-red-700"
                  : "text-brand-green"
                : e.reached
                  ? "text-gray-900"
                  : "text-gray-500"
            }`}
          >
            {e.label}
          </div>
          {e.current && e.at && (
            <div className="text-xs text-gray-500">sinds {formatDate(e.at)}</div>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function DossierDetail() {
  const { id } = useParams();
  const [aanvraag, setAanvraag] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [aRes, cRes] = await Promise.all([
          api.get(`/installateur/dossiers/${id}`),
          api.get(`/aanvragen/${id}/documenten`),
        ]);
        if (cancel) return;
        setAanvraag(aRes.data);
        setChecklist(cRes.data);
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
  }, [id]);

  async function downloadDocument(documentId) {
    try {
      const res = await api.get(
        `/aanvragen/${id}/documenten/${documentId}/download-url`,
      );
      window.open(res.data.download_url, "_blank", "noopener");
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="container-app py-10 text-gray-500">Laden…</div>
    );
  }
  if (error || !aanvraag) {
    return (
      <div className="container-app py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error || "Dossier niet gevonden."}
        </div>
        <Link
          to="/installateur/dossiers"
          className="mt-4 inline-block text-sm font-semibold text-brand-green hover:underline"
        >
          ← Terug naar dossiers
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-10">
      <Link
        to="/installateur/dossiers"
        className="mb-3 inline-block text-sm font-semibold text-brand-green hover:underline"
      >
        ← Terug naar dossiers
      </Link>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <RegelingBadge code={aanvraag.regeling} />
          <h1 className="text-2xl font-extrabold text-gray-900">
            {regelingLabel(aanvraag.regeling)} dossier
          </h1>
          <StatusBadge status={aanvraag.status} />
        </div>
        <div className="text-sm text-gray-600">
          Type: {typeAanvragerLabel(aanvraag.type_aanvrager)} · Maatregel:{" "}
          {maatregelLabel(aanvraag.maatregel)}
        </div>
      </div>

      <DeadlineBanner datum={aanvraag.deadline_datum} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-bold text-gray-900">
              Status timeline
            </h2>
            <div className="mt-4">
              <StatusTimeline events={aanvraag.status_timeline} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-bold text-gray-900">
              Documentenchecklist
            </h2>
            {checklist ? (
              <div className="mt-3">
                <div className="mb-3 text-sm text-gray-600">
                  {checklist.uploaded_count} van {checklist.required_count}{" "}
                  vereiste documenten aangeleverd.
                </div>
                <ul className="divide-y divide-gray-100">
                  {checklist.items.map((item) => (
                    <li
                      key={`${item.document_type}-${item.document_id ?? "x"}`}
                      className="flex flex-wrap items-center justify-between gap-2 py-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {item.label}
                          {!item.required && (
                            <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                              Extra
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.uploaded
                            ? item.verified
                              ? "Geverifieerd door AAA-Lex"
                              : "Aangeleverd, in review"
                            : "Nog niet aangeleverd"}
                        </div>
                      </div>
                      <div>
                        {item.uploaded && item.document_id ? (
                          <button
                            type="button"
                            onClick={() => downloadDocument(item.document_id)}
                            className="text-sm font-semibold text-brand-green hover:underline"
                          >
                            Download
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Geen checklist beschikbaar.</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-bold text-gray-900">
              Klantgegevens
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Organisatie
                </dt>
                <dd className="text-gray-800">
                  {aanvraag.organisation_name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Contactpersoon
                </dt>
                <dd className="text-gray-800">
                  {aanvraag.aanvrager_name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  E-mail
                </dt>
                <dd>
                  {aanvraag.aanvrager_email ? (
                    <a
                      className="text-brand-green hover:underline"
                      href={`mailto:${aanvraag.aanvrager_email}`}
                    >
                      {aanvraag.aanvrager_email}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">
                  Telefoon
                </dt>
                <dd className="text-gray-800">
                  {aanvraag.aanvrager_phone || "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-base font-bold text-gray-900">Financieel</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Investering</dt>
                <dd className="text-gray-800">
                  {formatEuro(aanvraag.investering_bedrag)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Geschatte subsidie</dt>
                <dd className="text-gray-800">
                  {formatEuro(aanvraag.geschatte_subsidie)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Toegekend</dt>
                <dd className="text-gray-800">
                  {formatEuro(aanvraag.toegekende_subsidie)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Deadline</dt>
                <dd className="text-gray-800">
                  {formatDate(aanvraag.deadline_datum)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
