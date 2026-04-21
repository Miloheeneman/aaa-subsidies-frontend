import { api, uploadToPresignedUrl } from "./api.js";

// ---------------------------------------------------------------------------
// Panden
// ---------------------------------------------------------------------------

export async function listPanden(params = {}) {
  const { data } = await api.get("/panden", { params });
  return data;
}

export async function createPand(payload) {
  const { data } = await api.post("/panden", payload);
  return data;
}

export async function getPand(pandId) {
  const { data } = await api.get(`/panden/${pandId}`);
  return data;
}

export async function updatePand(pandId, payload) {
  const { data } = await api.put(`/panden/${pandId}`, payload);
  return data;
}

export async function deletePand(pandId) {
  await api.delete(`/panden/${pandId}`);
}

// ---------------------------------------------------------------------------
// Maatregelen
// ---------------------------------------------------------------------------

export async function listMaatregelenVoorPand(pandId) {
  const { data } = await api.get(`/panden/${pandId}/maatregelen`);
  return data;
}

export async function createMaatregel(pandId, payload) {
  const { data } = await api.post(`/panden/${pandId}/maatregelen`, payload);
  return data;
}

export async function getMaatregel(maatregelId) {
  const { data } = await api.get(`/maatregelen/${maatregelId}`);
  return data;
}

export async function updateMaatregel(maatregelId, payload) {
  const { data } = await api.put(`/maatregelen/${maatregelId}`, payload);
  return data;
}

export async function deleteMaatregel(maatregelId) {
  await api.delete(`/maatregelen/${maatregelId}`);
}

// ---------------------------------------------------------------------------
// Documenten
// ---------------------------------------------------------------------------

export async function getChecklist(maatregelId) {
  const { data } = await api.get(`/maatregelen/${maatregelId}/checklist`);
  return data;
}

export async function listDocumenten(maatregelId) {
  const { data } = await api.get(`/maatregelen/${maatregelId}/documenten`);
  return data;
}

async function requestUploadUrl(maatregelId, payload) {
  const { data } = await api.post(
    `/maatregelen/${maatregelId}/documenten`,
    payload,
  );
  return data;
}

/**
 * 2-staps upload: vraag presigned URL aan en PUT het bestand ernaartoe.
 * Retourneert de document-record (minimaal id + r2_key).
 */
export async function uploadDocument({
  maatregelId,
  documentType,
  file,
  onProgress,
}) {
  const payload = {
    document_type: documentType,
    filename: file.name,
    content_type: file.type || "application/octet-stream",
  };
  const presign = await requestUploadUrl(maatregelId, payload);
  await uploadToPresignedUrl(presign.upload_url, file, {
    contentType: payload.content_type,
    onProgress,
  });
  return presign;
}

export async function verifyDocument(maatregelId, documentId) {
  const { data } = await api.post(
    `/maatregelen/${maatregelId}/documenten/${documentId}/verify`,
  );
  return data;
}

export async function deleteDocument(maatregelId, documentId) {
  await api.delete(
    `/maatregelen/${maatregelId}/documenten/${documentId}`,
  );
}

export async function getDocumentDownloadUrl(maatregelId, documentId) {
  const { data } = await api.get(
    `/maatregelen/${maatregelId}/documenten/${documentId}/download-url`,
  );
  return data.download_url;
}

export function isPandLimitError(error) {
  const detail = error?.response?.data?.detail;
  return detail && typeof detail === "object" && detail.code === "pand_limit_reached";
}

export function pandLimitInfo(error) {
  const detail = error?.response?.data?.detail;
  if (!isPandLimitError(error)) return null;
  return {
    plan: detail.plan,
    limit: detail.limit,
    current: detail.current,
    message: detail.message,
  };
}
