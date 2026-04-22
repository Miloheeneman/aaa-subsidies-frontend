import { api } from "./api.js";

// ---------------------------------------------------------------------------
// Constants (mirrored from backend enums; update both sides together)
// ---------------------------------------------------------------------------

export const PROJECT_TYPES = [
  { value: "woning", label: "Woning" },
  { value: "appartement", label: "Appartement" },
  { value: "kantoor", label: "Kantoor" },
  { value: "bedrijfspand", label: "Bedrijfspand" },
  { value: "zorginstelling", label: "Zorginstelling" },
  { value: "school", label: "School" },
  { value: "sportaccommodatie", label: "Sportaccommodatie" },
  { value: "overig", label: "Overig" },
];

export const EIGENAAR_TYPES = [
  { value: "eigenaar_bewoner", label: "Eigenaar-bewoner" },
  { value: "particulier_verhuurder", label: "Particuliere verhuurder" },
  { value: "zakelijk_verhuurder", label: "Zakelijke verhuurder" },
  { value: "vve", label: "VvE" },
  { value: "overig", label: "Overig" },
];

export const ENERGIELABELS = ["A", "B", "C", "D", "E", "F", "G"];

export const MAATREGEL_STATUSSEN = [
  { value: "orientatie", label: "Oriëntatie" },
  { value: "gepland", label: "Gepland" },
  { value: "uitgevoerd", label: "Uitgevoerd" },
  { value: "aangevraagd", label: "Aangevraagd" },
  { value: "goedgekeurd", label: "Goedgekeurd" },
  { value: "afgewezen", label: "Afgewezen" },
];

/**
 * Maatregelen gegroepeerd zoals ze in het 3-staps formulier worden getoond
 * (stap 1 = type selecteren). Houd volgorde gelijk aan backend enum zodat
 * de documenten-checklist 1-op-1 overeenkomt.
 */
export const MAATREGEL_GROEPEN = [
  {
    titel: "Warmte",
    items: [
      {
        value: "warmtepomp_lucht_water",
        label: "Warmtepomp lucht/water",
        regeling: "ISDE",
      },
      {
        value: "warmtepomp_water_water",
        label: "Warmtepomp water/water",
        regeling: "ISDE",
      },
      {
        value: "warmtepomp_hybride",
        label: "Hybride warmtepomp",
        regeling: "ISDE",
      },
      { value: "zonneboiler", label: "Zonneboiler", regeling: "ISDE" },
    ],
  },
  {
    titel: "Isolatie",
    items: [
      { value: "dakisolatie", label: "Dakisolatie", regeling: "ISDE" },
      { value: "gevelisolatie", label: "Gevelisolatie", regeling: "ISDE" },
      { value: "vloerisolatie", label: "Vloerisolatie", regeling: "ISDE" },
      { value: "hr_glas", label: "HR++ glas", regeling: "ISDE" },
    ],
  },
  {
    titel: "Zakelijk",
    items: [
      {
        value: "eia_investering",
        label: "EIA-investering",
        regeling: "EIA",
      },
      {
        value: "mia_vamil_investering",
        label: "MIA / VAMIL",
        regeling: "MIA",
      },
      {
        value: "dumava_maatregel",
        label: "DUMAVA-maatregel",
        regeling: "DUMAVA",
      },
    ],
  },
];

export const MAATREGEL_LABELS = Object.fromEntries(
  MAATREGEL_GROEPEN.flatMap((g) => g.items).map((m) => [m.value, m.label]),
);

export function maatregelLabel(value) {
  return MAATREGEL_LABELS[value] || value;
}

export function projectTypeLabel(value) {
  return PROJECT_TYPES.find((p) => p.value === value)?.label || value;
}

export function eigenaarTypeLabel(value) {
  return EIGENAAR_TYPES.find((p) => p.value === value)?.label || value;
}

export function maatregelStatusLabel(value) {
  return (
    MAATREGEL_STATUSSEN.find((s) => s.value === value)?.label || value
  );
}

// ---------------------------------------------------------------------------
// API wrappers
// ---------------------------------------------------------------------------

export async function listProjecten(params = {}) {
  const { data } = await api.get("/projecten", { params });
  return data; // { items, totaal, quota }
}

export async function getProject(id) {
  const { data } = await api.get(`/projecten/${id}`);
  return data;
}

export async function createProject(body) {
  const { data } = await api.post("/projecten", body);
  return data;
}

export async function updateProject(id, body) {
  const { data } = await api.put(`/projecten/${id}`, body);
  return data;
}

export async function deleteProject(id) {
  await api.delete(`/projecten/${id}`);
}

export async function listMaatregelen(projectId) {
  const { data } = await api.get(`/projecten/${projectId}/maatregelen`);
  return data;
}

export async function createMaatregel(projectId, body) {
  const { data } = await api.post(`/projecten/${projectId}/maatregelen`, body);
  return data;
}

export async function submitIsdeWarmtepompAanvraag(projectId, body) {
  const { data } = await api.post(
    `/projecten/${projectId}/aanvragen/isde-warmtepomp`,
    body,
  );
  return data;
}

export async function submitIsdeIsolatieAanvraag(projectId, body) {
  const { data } = await api.post(
    `/projecten/${projectId}/aanvragen/isde-isolatie`,
    body,
  );
  return data;
}

export async function submitEiaAanvraag(projectId, body) {
  const { data } = await api.post(`/projecten/${projectId}/aanvragen/eia`, body);
  return data;
}

export async function submitMiaVamilAanvraag(projectId, body) {
  const { data } = await api.post(
    `/projecten/${projectId}/aanvragen/mia-vamil`,
    body,
  );
  return data;
}

export async function submitDumavaAanvraag(projectId, body) {
  const { data } = await api.post(`/projecten/${projectId}/aanvragen/dumava`, body);
  return data;
}

export async function getMaatregel(id) {
  const { data } = await api.get(`/maatregelen/${id}`);
  return data;
}

export async function updateMaatregel(id, body) {
  const { data } = await api.put(`/maatregelen/${id}`, body);
  return data;
}

export async function deleteMaatregel(id) {
  await api.delete(`/maatregelen/${id}`);
}

export async function getChecklist(maatregelId) {
  const { data } = await api.get(`/maatregelen/${maatregelId}/checklist`);
  return data;
}

export async function listDocumenten(maatregelId) {
  const { data } = await api.get(`/maatregelen/${maatregelId}/documenten`);
  return data;
}

export async function requestDocumentUpload(maatregelId, body) {
  const { data } = await api.post(
    `/maatregelen/${maatregelId}/documenten`,
    body,
  );
  return data;
}

export async function confirmDocument(maatregelId, documentId) {
  const { data } = await api.post(
    `/maatregelen/${maatregelId}/documenten/${documentId}/confirm`,
  );
  return data;
}

export async function verifyDocument(maatregelId, documentId) {
  const { data } = await api.post(
    `/maatregelen/${maatregelId}/documenten/${documentId}/verify`,
  );
  return data;
}

export async function deleteDocument(maatregelId, documentId) {
  await api.delete(`/maatregelen/${maatregelId}/documenten/${documentId}`);
}

export async function kritiekeDeadlines(maxDagen = 30) {
  const { data } = await api.get("/admin/projecten/kritieke-deadlines", {
    params: { max_dagen: maxDagen },
  });
  return data;
}

export async function getSubsidiesVoorProject(projectId) {
  const { data } = await api.get(`/projecten/${projectId}/subsidies`);
  return data; // { project_id, eligible: [...], niet_eligible: [...] }
}

// ---------------------------------------------------------------------------
// Subsidie matching helpers (mirror van backend SubsidieMatch)
// ---------------------------------------------------------------------------

export const SUBSIDIE_REGELING_BADGE = {
  ISDE_WARMTEPOMP: "ISDE",
  ISDE_ISOLATIE: "ISDE",
  EIA: "EIA",
  MIA_VAMIL: "MIA",
  DUMAVA: "DUMAVA",
  SVVE: "SVVE",
};

export function deadlineUitleg(deadlineType, maanden) {
  if (deadlineType === "voor_offerte") {
    return `Aanvraag indienen vóór de offerte — uiterlijk ${maanden} maanden geldig`;
  }
  if (deadlineType === "na_installatie") {
    return `Aanvragen binnen ${maanden} maanden na installatie`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Deadline helpers
// ---------------------------------------------------------------------------

export const DEADLINE_COLORS = {
  ok: "bg-brand-greenLight text-brand-greenDark border-brand-green/30",
  waarschuwing: "bg-amber-50 text-amber-800 border-amber-200",
  kritiek: "bg-red-50 text-red-800 border-red-200",
  verlopen: "bg-red-100 text-red-900 border-red-300",
};

export const DEADLINE_LABELS = {
  ok: "Op tijd",
  waarschuwing: "Let op",
  kritiek: "Kritiek",
  verlopen: "Verlopen",
};
