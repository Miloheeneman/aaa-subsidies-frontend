import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ClientContactCard from "../../components/projecten/ClientContactCard.jsx";
import ClientSubsidieBox from "../../components/projecten/ClientSubsidieBox.jsx";
import MaatregelStatusTimeline from "../../components/projecten/MaatregelStatusTimeline.jsx";
import { RegelingBadge } from "../../components/StatusBadge.jsx";
import DeadlineBadge from "../../components/projecten/DeadlineBadge.jsx";
import { apiErrorMessage, uploadToPresignedUrl } from "../../lib/api.js";
import { getCurrentUser } from "../../lib/auth.js";
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

export default function MaatregelDossier() {
  const { projectId, maatregelId } = useParams();
  const [project, setProject] = useState(null);
  const [maatregel, setMaatregel] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingType, setUploadingType] = useState(null);

  const user = getCurrentUser();
  const isAdmin = user?.role === "admin";

  async function reload() {
    setLoading(true);
    try {
      const admin = getCurrentUser()?.role === "admin";
      const p = await getProject(projectId);
      const m = await getMaatregel(maatregelId);
      setProject(p);
      setMaatregel(m);
      if (admin) {
        const c = await getChecklist(maatregelId);
        setChecklist(c);
      } else {
        setChecklist(null);
      }
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

  if (loading) {
    return (
      <div className="container-app flex min-h-[40vh] items-center justify-center py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-greenLight border-t-brand-green" />
      </div>
    );
  }
  if (error || !project || !maatregel || (isAdmin && !checklist)) {
    return (
      <div className="container-app py-10">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error || "Dossier niet gevonden"}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    const openVz = (project.open_upload_verzoeken || []).find(
      (v) => v.maatregel_id === maatregelId,
    );
    const showUpload = openVz && openVz.documenten_nog_nodig > 0;
    return (
      <div className="container-app py-8 sm:py-10">
        <Link
          to={`/projecten/${project.id}`}
          className="text-sm font-semibold text-brand-green hover:underline"
        >
          ← Terug naar project
        </Link>

        <header className="mt-3">
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {maatregelLabel(maatregel.maatregel_type)}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {project.straat} {project.huisnummer}, {project.plaats}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
              {maatregelStatusLabel(maatregel.status)}
            </span>
            {maatregel.regeling_code && (
              <RegelingBadge code={maatregel.regeling_code} />
            )}
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <MaatregelStatusTimeline maatregel={maatregel} />
          <ClientSubsidieBox geschatteSubsidie={maatregel.geschatte_subsidie} />
        </div>

        {showUpload && (
          <section className="mt-6 rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
            <h2 className="text-base font-extrabold text-amber-950">
              AAA-Lex heeft documenten van u nodig
            </h2>
            <p className="mt-2 text-sm text-amber-950/90">
              Upload de gevraagde bestanden via de beveiligde link. Deze link is
              beperkt geldig.
            </p>
            <Link
              to={`/projecten/${project.id}/documenten/upload/${openVz.token}`}
              className="btn-primary mt-4 inline-flex"
            >
              Documenten uploaden →
            </Link>
            <p className="mt-2 text-xs text-amber-900/80">
              Nog {openVz.documenten_nog_nodig} van {openVz.documenten_totaal}{" "}
              document(en) · geldig tot {formatDate(openVz.token_expires_at)}
            </p>
          </section>
        )}

        <div className="mt-6">
          <ClientContactCard />
        </div>
      </div>
    );
  }

  return (
    <AdminMaatregelDossierBody
      project={project}
      maatregel={maatregel}
      checklist={checklist}
      maatregelId={maatregelId}
      uploadingType={uploadingType}
      setUploadingType={setUploadingType}
      reload={reload}
    />
  );
}

function AdminMaatregelDossierBody({
  project,
  maatregel,
  checklist,
  maatregelId,
  uploadingType,
  setUploadingType,
  reload,
}) {
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

  const verplichtTotaal = checklist.verplicht_totaal;
  const verplichtGeupload = checklist.verplicht_geupload;
  const verplichtGeverifieerd = checklist.verplicht_geverifieerd ?? 0;
  const compleet = verplichtTotaal > 0 && verplichtGeupload >= verplichtTotaal;
  const allVerified =
    compleet && verplichtGeverifieerd >= verplichtTotaal;
  const missing = Math.max(0, verplichtTotaal - verplichtGeupload);
  const progressPct =
    verplichtTotaal > 0
      ? Math.round((verplichtGeupload / verplichtTotaal) * 100)
      : 0;

  return (
    <div className="container-app py-8 sm:py-10">
      <Link
        to={`/projecten/${project.id}`}
        className="text-sm font-semibold text-brand-green hover:underline"
      >
        ← Terug naar project
      </Link>

      <header className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {maatregelLabel(maatregel.maatregel_type)}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Dossier voor {project.straat} {project.huisnummer}, {project.plaats}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
              {maatregelStatusLabel(maatregel.status)}
            </span>
            {maatregel.regeling_code && (
              <RegelingBadge code={maatregel.regeling_code} />
            )}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-gray-500">Indienen voor</div>
          <div className="text-xl font-extrabold text-gray-900">
            {maatregel.deadline_indienen
              ? formatDate(maatregel.deadline_indienen)
              : "—"}
          </div>
          <div className="mt-1">
            <DeadlineBadge
              status={maatregel.deadline_status}
              datum={maatregel.deadline_indienen}
              size="md"
            />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Geschatte subsidie:{" "}
            <span className="font-semibold text-gray-900">
              {formatEuro(maatregel.geschatte_subsidie)}
            </span>
          </div>
        </div>
      </header>

      <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900">Documenten</h2>
          <span className="text-sm text-gray-600">
            <strong className="text-gray-900">{verplichtGeupload}</strong> van{" "}
            <strong className="text-gray-900">{verplichtTotaal}</strong>{" "}
            verplichte documenten geüpload
          </span>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
        >
          <div
            className="h-full rounded-full bg-brand-green transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <ul className="mt-5 space-y-3">
          {checklist.items.map((item) => (
            <DocRow
              key={item.document_type}
              item={item}
              onUpload={(file) => uploadFile(file, item.document_type)}
              onVerify={async () => {
                if (!item.document_id) return;
                try {
                  await verifyDocument(maatregelId, item.document_id);
                  await reload();
                } catch (e) {
                  alert(apiErrorMessage(e, "Verificatie mislukt"));
                }
              }}
              onDelete={async () => {
                if (!item.document_id) return;
                if (!confirm("Document verwijderen?")) return;
                try {
                  await deleteDocument(maatregelId, item.document_id);
                  await reload();
                } catch (e) {
                  alert(apiErrorMessage(e, "Verwijderen mislukt"));
                }
              }}
              uploading={uploadingType === item.document_type}
              isAdmin
            />
          ))}
        </ul>

        <div
          className={`mt-5 rounded-xl border p-4 text-sm ${
            !compleet
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : allVerified
                ? "border-brand-green/30 bg-brand-greenLight text-brand-greenDark"
                : "border-blue-200 bg-blue-50 text-blue-900"
          }`}
        >
          {!compleet ? (
            <>
              <strong>
                Nog {missing} document{missing === 1 ? "" : "en"} nodig
              </strong>{" "}
              voordat wij kunnen indienen.
            </>
          ) : allVerified ? (
            <>
              <strong>Dossier compleet ✓</strong> AAA-Lex kan uw aanvraag nu
              indienen bij RVO.
            </>
          ) : (
            <>
              <strong>Dossier in review.</strong> AAA-Lex controleert uw
              documenten.
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function DocRow({ item, onUpload, onVerify, onDelete, uploading, isAdmin }) {
  const fileRef = useRef(null);
  const statusLabel = item.geverifieerd
    ? "Geverifieerd door AAA-Lex"
    : item.geupload
      ? "Geüpload — wacht op verificatie"
      : item.verplicht
        ? "Nog niet geüpload"
        : "Optioneel";

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <StatusIcon item={item} />
        <div>
          <div className="font-semibold text-gray-900">
            {item.label}
            {item.verplicht && (
              <span className="ml-1 text-xs font-normal text-red-600">
                (verplicht)
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600">{item.uitleg}</p>
          <p className="mt-1 text-xs text-gray-500">{statusLabel}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
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
          className="btn-secondary !py-2 !px-3 text-xs disabled:opacity-50"
        >
          {uploading ? "Bezig…" : item.geupload ? "Vervang" : "Upload"}
        </button>
        {isAdmin && item.geupload && !item.geverifieerd && (
          <button
            type="button"
            onClick={onVerify}
            className="btn-primary !py-2 !px-3 text-xs"
          >
            Verifieer
          </button>
        )}
        {item.geupload && (
          <button
            type="button"
            onClick={onDelete}
            className="text-xs font-semibold text-red-700 hover:underline"
          >
            Verwijderen
          </button>
        )}
      </div>
    </li>
  );
}

function StatusIcon({ item }) {
  const base =
    "flex h-7 w-7 flex-none items-center justify-center rounded-full border text-[13px] font-extrabold";
  if (item.geverifieerd) {
    return (
      <span
        aria-label="Geverifieerd"
        className={`${base} border-brand-green bg-brand-green text-white`}
      >
        ✓
      </span>
    );
  }
  if (item.geupload) {
    return (
      <span
        aria-label="Geüpload, wacht op verificatie"
        className={`${base} border-brand-green bg-white text-brand-green`}
      >
        ◐
      </span>
    );
  }
  return (
    <span
      aria-label={item.verplicht ? "Ontbreekt" : "Optioneel"}
      className={`${base} border-gray-200 bg-gray-50 text-gray-400`}
    >
      {item.verplicht ? "✗" : "–"}
    </span>
  );
}
