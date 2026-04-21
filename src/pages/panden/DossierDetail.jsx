import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  DeadlineBadge,
  MaatregelStatusBadge,
  RegelingPandBadge,
} from "../../components/panden/PandBadges.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import { getCurrentUser } from "../../lib/auth.js";
import {
  formatDate,
  formatEuro,
  maatregelTypeLabel,
} from "../../lib/formatters.js";
import {
  deleteDocument,
  getChecklist,
  getMaatregel,
  getPand,
  uploadDocument,
  verifyDocument,
} from "../../lib/pandenApi.js";

export default function DossierDetail() {
  const { pandId, maatregelId } = useParams();
  const me = getCurrentUser();
  const isAdmin = me?.role === "admin";

  const [pand, setPand] = useState(null);
  const [maatregel, setMaatregel] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function reload() {
    try {
      const [p, m, cl] = await Promise.all([
        getPand(pandId),
        getMaatregel(maatregelId),
        getChecklist(maatregelId),
      ]);
      setPand(p);
      setMaatregel(m);
      setChecklist(cl);
      setError(null);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pandId, maatregelId]);

  if (loading) {
    return (
      <div className="container-app flex min-h-[50vh] items-center justify-center py-14">
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
  if (!pand || !maatregel || !checklist) return null;

  const compleet = checklist.compleet;

  return (
    <div className="container-app py-8 sm:py-10">
      <Link
        to={`/panden/${pandId}`}
        className="text-sm font-semibold text-brand-green hover:underline"
      >
        ← Terug naar {pand.straat} {pand.huisnummer}
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {maatregelTypeLabel(maatregel.maatregel_type)}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <MaatregelStatusBadge status={maatregel.status} />
            <RegelingPandBadge code={maatregel.regeling_code} />
            {maatregel.deadline_indienen && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-700">
                Indienen voor:{" "}
                <strong className="font-semibold text-gray-900">
                  {formatDate(maatregel.deadline_indienen)}
                </strong>
              </span>
            )}
            <DeadlineBadge
              status={maatregel.deadline_status}
              datum={maatregel.deadline_indienen}
            />
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Geschatte subsidie
          </div>
          <div className="mt-1 text-xl font-extrabold text-brand-greenDark">
            {formatEuro(maatregel.geschatte_subsidie)}
          </div>
          {maatregel.toegekende_subsidie != null && (
            <div className="mt-1 text-xs text-gray-600">
              Toegekend:{" "}
              <strong className="font-semibold text-gray-900">
                {formatEuro(maatregel.toegekende_subsidie)}
              </strong>
            </div>
          )}
        </div>
      </div>

      <div
        className={`mt-5 rounded-xl border p-4 text-sm ${
          compleet
            ? "border-brand-green/30 bg-brand-greenLight text-brand-greenDark"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        {compleet ? (
          <>
            <strong className="font-bold">Dossier compleet</strong> — AAA-Lex
            kan uw aanvraag indienen bij RVO.
          </>
        ) : (
          <>
            <strong className="font-bold">{checklist.missing_count}</strong>{" "}
            {checklist.missing_count === 1 ? "document" : "documenten"} nog
            nodig voordat wij kunnen indienen.
          </>
        )}
      </div>

      <h2 className="mt-8 text-lg font-bold text-gray-900">Documenten</h2>
      <div className="mt-3 space-y-3">
        {checklist.items.map((item) => (
          <ChecklistRow
            key={item.document_type + (item.document_id || "")}
            item={item}
            maatregelId={maatregel.id}
            isAdmin={isAdmin}
            onChanged={reload}
          />
        ))}
      </div>
    </div>
  );
}

function statusIcon(item) {
  if (!item.geupload) {
    return (
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-700"
        aria-label="Nog niet geüpload"
      >
        ✕
      </span>
    );
  }
  if (item.geupload && !item.geverifieerd) {
    return (
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-700"
        aria-label="Wacht op verificatie"
        title="Wacht op verificatie door AAA-Lex"
      >
        ⏱
      </span>
    );
  }
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-greenLight text-brand-greenDark"
      aria-label="Geverifieerd"
    >
      ✓
    </span>
  );
}

function ChecklistRow({ item, maatregelId, isAdmin, onChanged }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      await uploadDocument({
        maatregelId,
        documentType: item.document_type,
        file,
        onProgress: setProgress,
      });
      onChanged();
    } catch (err) {
      setError(apiErrorMessage(err, "Upload mislukt."));
    } finally {
      setUploading(false);
    }
  }

  async function handleVerify() {
    try {
      await verifyDocument(maatregelId, item.document_id);
      onChanged();
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  }

  async function handleDelete() {
    if (!window.confirm("Document verwijderen?")) return;
    try {
      await deleteDocument(maatregelId, item.document_id);
      onChanged();
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-start gap-4">
        <div className="pt-0.5">{statusIcon(item)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="text-sm font-bold text-gray-900">{item.label}</h3>
            {item.verplicht ? (
              <span className="text-xs text-red-700">verplicht</span>
            ) : (
              <span className="text-xs text-gray-500">optioneel</span>
            )}
          </div>
          {item.uitleg && (
            <p className="mt-1 text-xs text-gray-600">{item.uitleg}</p>
          )}
          {item.bestandsnaam && (
            <p className="mt-2 truncate text-xs text-gray-500">
              📄 {item.bestandsnaam}
              {item.geverifieerd && (
                <span className="ml-2 font-semibold text-brand-green">
                  · geverifieerd
                </span>
              )}
            </p>
          )}
          {uploading && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-brand-green transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          {error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFile}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 hover:border-brand-green hover:text-brand-green disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploaden..." : item.geupload ? "Vervangen" : "Upload"}
          </button>
          {item.document_id && isAdmin && !item.geverifieerd && (
            <button
              type="button"
              onClick={handleVerify}
              className="rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-greenDark"
            >
              Verifieer
            </button>
          )}
          {item.document_id && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-red-600 hover:underline"
            >
              Verwijder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
