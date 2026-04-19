import { useRef, useState } from "react";

import api, { apiErrorMessage, uploadToPresignedUrl } from "../lib/api.js";

function StateBadge({ uploaded, verified }) {
  const meta = verified
    ? { label: "Geverifieerd", classes: "text-green-700 bg-green-50" }
    : uploaded
      ? { label: "Geüpload (in review)", classes: "text-blue-700 bg-blue-50" }
      : { label: "Niet geüpload", classes: "text-gray-500 bg-gray-50" };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${meta.classes}`}
    >
      {meta.label}
    </span>
  );
}

function ChecklistRow({
  aanvraagId,
  item,
  onChanged,
  showVerifyButton,
  onVerify,
}) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setBusy(true);
    setProgress(0);
    try {
      const presign = await api.post(
        `/aanvragen/${aanvraagId}/documenten/upload-url`,
        {
          document_type: item.document_type,
          filename: file.name,
          content_type: file.type || "application/octet-stream",
        },
      );
      await uploadToPresignedUrl(presign.data.upload_url, file, {
        contentType: file.type || "application/octet-stream",
        onProgress: setProgress,
      });
      await api.post(
        `/aanvragen/${aanvraagId}/documenten/${presign.data.document_id}/confirm`,
      );
      setProgress(100);
      await onChanged?.();
    } catch (err) {
      setError(apiErrorMessage(err, "Upload mislukt."));
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(null), 1500);
    }
  }

  async function handleDownload() {
    setError(null);
    try {
      const res = await api.get(
        `/aanvragen/${aanvraagId}/documenten/${item.document_id}/download-url`,
      );
      window.open(res.data.download_url, "_blank", "noopener");
    } catch (err) {
      setError(apiErrorMessage(err, "Download mislukt."));
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Weet u zeker dat u "${item.label}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`,
      )
    ) {
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await api.delete(
        `/aanvragen/${aanvraagId}/documenten/${item.document_id}`,
      );
      await onChanged?.();
    } catch (err) {
      setError(apiErrorMessage(err, "Verwijderen mislukt."));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify() {
    setError(null);
    setBusy(true);
    try {
      await onVerify?.(item.document_id);
    } catch (err) {
      setError(apiErrorMessage(err, "Verifiëren mislukt."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="font-semibold text-gray-900">{item.label}</div>
          <div className="mt-1 flex items-center gap-2">
            <StateBadge uploaded={item.uploaded} verified={item.verified} />
            <span className="text-xs text-gray-400">
              {item.required ? "Vereist" : "Optioneel"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-md border border-brand-green bg-brand-green px-3 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-60"
          >
            {item.uploaded ? "Vervangen" : "Uploaden"}
          </button>
          {item.uploaded && item.document_id && (
            <button
              type="button"
              disabled={busy}
              onClick={handleDownload}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              Download
            </button>
          )}
          {item.uploaded && !item.verified && item.document_id && (
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              Verwijder
            </button>
          )}
          {showVerifyButton && item.uploaded && !item.verified && item.document_id && (
            <button
              type="button"
              disabled={busy}
              onClick={handleVerify}
              className="rounded-md border border-brand-green bg-white px-3 py-2 text-xs font-semibold text-brand-green hover:bg-brand-greenLight disabled:opacity-60"
            >
              Goedkeuren
            </button>
          )}
        </div>
      </div>
      {progress !== null && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-2 bg-brand-green transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error && <div className="text-xs text-red-700">{error}</div>}
    </li>
  );
}

export default function DocumentChecklist({
  aanvraagId,
  checklist,
  onChanged,
  allowVerify = false,
}) {
  async function handleVerify(documentId) {
    await api.patch(`/admin/documenten/${documentId}/verify`);
    await onChanged?.();
  }

  if (!checklist) {
    return <p className="text-sm text-gray-500">Checklist laden…</p>;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
        <span>
          {checklist.uploaded_count} van {checklist.required_count} geüpload ·{" "}
          <span
            className={
              checklist.missing_count > 0
                ? "font-semibold text-amber-700"
                : "font-semibold text-green-700"
            }
          >
            {checklist.missing_count} ontbrekend
          </span>
        </span>
      </div>
      <ul className="grid gap-2">
        {checklist.items.map((it) => (
          <ChecklistRow
            key={`${it.document_type}-${it.document_id ?? "none"}`}
            aanvraagId={aanvraagId}
            item={it}
            onChanged={onChanged}
            showVerifyButton={allowVerify}
            onVerify={handleVerify}
          />
        ))}
      </ul>
    </div>
  );
}
