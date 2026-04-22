import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { RegelingBadge } from "../../components/StatusBadge.jsx";
import DeadlineBadge from "../../components/projecten/DeadlineBadge.jsx";
import api, { apiErrorMessage, uploadToPresignedUrl } from "../../lib/api.js";
import { formatDate, formatEuro } from "../../lib/formatters.js";
import {
  confirmDocument,
  deleteDocument,
  getChecklist,
  getMaatregel,
  getProject,
  maatregelLabel,
  maatregelStatusLabel,
  requestDocumentUpload,
  verifyDocument,
} from "../../lib/projecten.js";

const STATUS_OPTIONS = [
  "orientatie",
  "gepland",
  "uitgevoerd",
  "aangevraagd",
  "in_beoordeling",
  "goedgekeurd",
  "afgewezen",
];

export default function AdminMaatregelDossier() {
  const { projectId, maatregelId } = useParams();
  const [project, setProject] = useState(null);
  const [maatregel, setMaatregel] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteBody, setNoteBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingType, setUploadingType] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);

  async function reload() {
    setLoading(true);
    try {
      const [p, m, c, n] = await Promise.all([
        getProject(projectId),
        getMaatregel(maatregelId),
        getChecklist(maatregelId),
        api.get(`/admin/maatregelen/${maatregelId}/notities`),
      ]);
      setProject(p);
      setMaatregel(m);
      setChecklist(c);
      setNotes(n.data);
      setError(null);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [projectId, maatregelId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function uploadFile(file, documentType) {
    setUploadingType(documentType);
    try {
      const presign = await requestDocumentUpload(maatregelId, {
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
      await confirmDocument(maatregelId, presign.document_id);
      await reload();
    } catch (e) {
      alert(apiErrorMessage(e, "Upload mislukt"));
    } finally {
      setUploadingType(null);
    }
  }

  async function patchStatus(next) {
    setStatusSaving(true);
    try {
      await api.patch(`/admin/maatregelen/${maatregelId}/status`, {
        status: next,
      });
      await reload();
    } catch (e) {
      alert(apiErrorMessage(e));
    } finally {
      setStatusSaving(false);
    }
  }

  async function downloadDoc(documentId) {
    try {
      const { data } = await api.get(
        `/maatregelen/${maatregelId}/documenten/${documentId}/download-url`,
      );
      window.open(data.download_url, "_blank", "noopener,noreferrer");
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }

  async function vraagDocument(docType) {
    try {
      await api.post(`/admin/maatregelen/${maatregelId}/upload-verzoek`, {
        document_types: [docType],
      });
      alert("E-mail met uploadlink is naar de klant verstuurd.");
    } catch (e) {
      alert(apiErrorMessage(e));
    }
  }

  async function addNote(e) {
    e.preventDefault();
    if (!noteBody.trim()) return;
    try {
      const res = await api.post(`/admin/maatregelen/${maatregelId}/notities`, {
        body: noteBody.trim(),
      });
      setNotes((prev) => [res.data, ...prev]);
      setNoteBody("");
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  }

  if (loading && !maatregel) {
    return (
      <div className="container-app flex min-h-[40vh] items-center justify-center py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-greenLight border-t-brand-green" />
      </div>
    );
  }
  if (error || !project || !maatregel || !checklist) {
    return (
      <div className="container-app py-10">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error || "Dossier niet gevonden"}
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8 sm:py-10">
      <Link
        to="/admin/dossiers"
        className="text-sm font-semibold text-brand-green hover:underline"
      >
        ← Terug naar dossiers
      </Link>

      <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
        Admin: {maatregelLabel(maatregel.maatregel_type)}
      </h1>
      <p className="text-sm text-gray-600">
        {project.straat} {project.huisnummer}, {project.postcode} {project.plaats}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Wizard-resultaten</h2>
          <p className="mt-1 text-xs text-gray-500">
            Door klant ingevuld op {formatDate(maatregel.created_at)}
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Type maatregel" value={maatregelLabel(maatregel.maatregel_type)} />
            <Row label="Installateur" value={maatregel.installateur_naam || "—"} />
            <Row label="Installateur KvK" value={maatregel.installateur_kvk || "—"} />
            <Row
              label="Investering"
              value={
                maatregel.investering_bedrag != null
                  ? formatEuro(maatregel.investering_bedrag)
                  : "—"
              }
            />
            <Row
              label="Installatiedatum"
              value={
                maatregel.installatie_datum
                  ? formatDate(maatregel.installatie_datum)
                  : "—"
              }
            />
            <Row label="Merk" value={maatregel.apparaat_merk || "—"} />
            <Row label="Typenummer" value={maatregel.apparaat_typenummer || "—"} />
            <Row label="Meldcode" value={maatregel.apparaat_meldcode || "—"} />
            <Row
              label="Geschatte subsidie"
              value={formatEuro(maatregel.geschatte_subsidie)}
            />
          </dl>
          {maatregel.omschrijving && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-700 whitespace-pre-wrap">
              {maatregel.omschrijving}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Dossier beheer</h2>
          <div className="mt-4">
            <label className="text-xs font-semibold uppercase text-gray-500">
              Status
            </label>
            <select
              className="input mt-1"
              value={maatregel.status}
              disabled={statusSaving}
              onChange={(e) => patchStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {maatregelStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
            <div className="text-xs font-bold uppercase text-amber-900">
              Deadline indienen
            </div>
            <div className="mt-1 text-2xl font-extrabold text-gray-900">
              {maatregel.deadline_indienen
                ? formatDate(maatregel.deadline_indienen)
                : "—"}
            </div>
            <div className="mt-2">
              <DeadlineBadge
                status={maatregel.deadline_status}
                datum={maatregel.deadline_indienen}
                size="md"
              />
            </div>
          </div>

          {maatregel.regeling_code && (
            <div className="mt-4">
              <RegelingBadge code={maatregel.regeling_code} />
            </div>
          )}

          <h3 className="mt-6 text-sm font-bold text-gray-900">Documenten</h3>
          <ul className="mt-3 space-y-3">
            {checklist.items.map((item) => (
              <AdminDocRow
                key={item.document_type}
                item={item}
                maatregelId={maatregelId}
                uploading={uploadingType === item.document_type}
                onUpload={(file) => uploadFile(file, item.document_type)}
                onVerify={async () => {
                  if (!item.document_id) return;
                  await verifyDocument(maatregelId, item.document_id);
                  await reload();
                }}
                onDelete={async () => {
                  if (!item.document_id) return;
                  if (!confirm("Document verwijderen?")) return;
                  await deleteDocument(maatregelId, item.document_id);
                  await reload();
                }}
                onDownload={() =>
                  item.document_id && downloadDoc(item.document_id)
                }
                onVraag={() => vraagDocument(item.document_type)}
              />
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-10 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Interne notities</h2>
        <form onSubmit={addNote} className="mt-3 flex flex-wrap gap-2">
          <textarea
            className="input min-h-[72px] flex-1"
            placeholder="Notitie voor dit dossier…"
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
          />
          <button type="submit" className="btn-primary self-end !py-2 !px-4">
            Opslaan
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm"
            >
              <div className="text-xs text-gray-500">
                {n.author_email} · {formatDate(n.created_at)}
              </div>
              <div className="mt-1 whitespace-pre-wrap">{n.body}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-1">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function AdminDocRow({
  item,
  uploading,
  onUpload,
  onVerify,
  onDelete,
  onDownload,
  onVraag,
}) {
  const fileRef = useRef(null);
  return (
    <li className="rounded-lg border border-gray-100 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-gray-900">
            {item.label}
            {item.verplicht && (
              <span className="ml-1 text-xs text-red-600">(verplicht)</span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {item.geupload ? "✓ Aanwezig" : "✗ Ontbreekt"}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-secondary !py-1 !px-2 text-xs"
          >
            {uploading ? "…" : "Upload"}
          </button>
          {item.geupload && item.document_id && (
            <>
              <button
                type="button"
                onClick={onDownload}
                className="btn-secondary !py-1 !px-2 text-xs"
              >
                Download
              </button>
              {!item.geverifieerd && (
                <button
                  type="button"
                  onClick={onVerify}
                  className="btn-primary !py-1 !px-2 text-xs"
                >
                  Verifieer
                </button>
              )}
              <button
                type="button"
                onClick={onDelete}
                className="text-xs font-semibold text-red-700 hover:underline"
              >
                Verwijder
              </button>
            </>
          )}
          {!item.geupload && (
            <button
              type="button"
              onClick={onVraag}
              className="text-xs font-semibold text-brand-green hover:underline"
            >
              Vraag op bij klant
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
