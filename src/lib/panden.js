import { api } from "./api.js";

// ---------------------------------------------------------------------------
// Constants (mirrored from backend enums; update both sides together)
// ---------------------------------------------------------------------------

export const PAND_TYPES = [
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

export function pandTypeLabel(value) {
  return PAND_TYPES.find((p) => p.value === value)?.label || value;
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

export async function listPanden(params = {}) {
  const { data } = await api.get("/panden", { params });
  return data; // { items, totaal, quota }
}

export async function getPand(id) {
  const { data } = await api.get(`/panden/${id}`);
  return data;
}

export async function createPand(body) {
  const { data } = await api.post("/panden", body);
  return data;
}

export async function updatePand(id, body) {
  const { data } = await api.put(`/panden/${id}`, body);
  return data;
}

export async function deletePand(id) {
  await api.delete(`/panden/${id}`);
}

export async function listMaatregelen(pandId) {
  const { data } = await api.get(`/panden/${pandId}/maatregelen`);
  return data;
}

export async function createMaatregel(pandId, body) {
  const { data } = await api.post(`/panden/${pandId}/maatregelen`, body);
  return data;
}

export async function submitIsdeWarmtepompAanvraag(pandId, body) {
  const { data } = await api.post(
    `/panden/${pandId}/aanvragen/isde-warmtepomp`,
    body,
  );
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
  const { data } = await api.get("/admin/panden/kritieke-deadlines", {
    params: { max_dagen: maxDagen },
  });
  return data;
}

export async function getSubsidiesVoorPand(pandId) {
  const { data } = await api.get(`/panden/${pandId}/subsidies`);
  return data; // { pand_id, eligible: [...], niet_eligible: [...] }
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
