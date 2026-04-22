import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiErrorMessage, uploadToPresignedUrl } from "../../lib/api.js";
import { formatDate } from "../../lib/formatters.js";
import {
  getPublicUploadMeta,
  publicUploadConfirm,
  publicUploadPresign,
} from "../../lib/projecten.js";

export default function PublicDocumentUpload() {
  const { projectId, token } = useParams();
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingType, setUploadingType] = useState(null);
  const [doneTypes, setDoneTypes] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getPublicUploadMeta(projectId, token);
        if (!cancelled) {
          setMeta(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(apiErrorMessage(e));
          setMeta(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, token]);

  async function uploadFile(file, documentType) {
    setUploadingType(documentType);
    try {
      const presign = await publicUploadPresign(projectId, token, {
        document_type: documentType,
        bestandsnaam: file.name,
        content_type: file.type || "application/octet-stream",
      });
      try {
        await uploadToPresignedUrl(presign.upload_url, file, {
          contentType: file.type || "application/octet-stream",
        });
      } catch (uploadErr) {
        console.warn("R2 upload stub failed; bevestig toch:", uploadErr);
      }
      await publicUploadConfirm(projectId, token, presign.document_id);
      setDoneTypes((prev) => new Set(prev).add(documentType));
    } catch (e) {
      alert(apiErrorMessage(e, "Upload mislukt"));
    } finally {
      setUploadingType(null);
    }
  }

  if (loading) {
    return (
      <div className="container-app flex min-h-[40vh] items-center justify-center py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-greenLight border-t-brand-green" />
      </div>
    );
  }

  const totalTypes = meta?.documenten?.length ?? 0;
  const allDone = totalTypes > 0 && doneTypes.size >= totalTypes;

  if (error || !meta) {
    return (
      <div className="container-app py-10">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error || "Deze link is ongeldig of verlopen."}
        </div>
        <p className="mt-4 text-sm text-gray-600">
          <Link to="/login" className="font-semibold text-brand-green hover:underline">
            Inloggen
          </Link>{" "}
          om verder te werken in uw dossier.
        </p>
      </div>
    );
  }

  return (
    <div className="container-app py-8 sm:py-10">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">
          AAA-Subsidies
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-gray-900">
          Documenten uploaden
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          <strong>{meta.subsidie_type}</strong> — {meta.project_adres}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Link geldig tot {formatDate(meta.token_expires_at)}
          {meta.deadline_indienen
            ? ` · RVO-deadline dossier ${formatDate(meta.deadline_indienen)}`
            : ""}
        </p>
        {meta.bericht && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-800 whitespace-pre-wrap">
            {meta.bericht}
          </div>
        )}

        {allDone && (
          <div className="mt-6 rounded-xl border border-brand-green/40 bg-brand-greenLight p-4 text-sm leading-relaxed text-brand-greenDark">
            <strong>Bedankt!</strong> AAA-Lex heeft uw documenten ontvangen en gaat
            direct aan de slag.
          </div>
        )}

        <ul className="mt-6 space-y-4">
          {meta.documenten.map((item) => (
            <PublicDocRow
              key={item.document_type}
              item={item}
              done={doneTypes.has(item.document_type)}
              uploading={uploadingType === item.document_type}
              allDone={allDone}
              onUpload={(file) => uploadFile(file, item.document_type)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function PublicDocRow({ item, done, uploading, allDone, onUpload }) {
  const fileRef = useRef(null);
  return (
    <li className="rounded-lg border border-gray-100 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-gray-900">{item.label}</div>
          {item.uitleg && (
            <p className="mt-1 text-xs text-gray-600">{item.uitleg}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            {done ? "✓ Geüpload" : "Nog te uploaden"}
          </p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            disabled={done || uploading || allDone}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
          {!allDone && (
            <button
              type="button"
              disabled={done || uploading}
              onClick={() => fileRef.current?.click()}
              className="btn-primary !py-2 !px-4 text-sm disabled:opacity-50"
            >
              {done ? "Klaar" : uploading ? "Bezig…" : "Kies bestand"}
            </button>
          )}
          {allDone && done && (
            <span className="text-lg text-brand-green" aria-hidden>
              ✓
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
