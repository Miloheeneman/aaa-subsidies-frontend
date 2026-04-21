export function formatEuro(value, { digits = 0 } = {}) {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(num);
}

export function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat("nl-NL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

export function daysUntil(iso) {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

const REGELING_LABELS = {
  ISDE: "ISDE",
  EIA: "EIA",
  MIA: "MIA",
  VAMIL: "Vamil",
  DUMAVA: "DUMAVA",
};

export function regelingLabel(code) {
  return REGELING_LABELS[code] ?? code;
}

const TYPE_AANVRAGER_LABELS = {
  particulier: "Particulier",
  zakelijk: "Zakelijk verhuurder",
  vve: "VvE",
  maatschappelijk: "Maatschappelijk vastgoed",
  ondernemer: "Ondernemer / bedrijf",
};

export function typeAanvragerLabel(code) {
  return TYPE_AANVRAGER_LABELS[code] ?? code;
}

const MAATREGEL_LABELS = {
  warmtepomp: "Warmtepomp",
  isolatie: "Isolatie",
  energiesysteem: "Energiezuinig systeem",
  meerdere: "Meerdere maatregelen",
};

export function maatregelLabel(code) {
  return MAATREGEL_LABELS[code] ?? code;
}
