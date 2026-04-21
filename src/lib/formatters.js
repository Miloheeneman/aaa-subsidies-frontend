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

// ---------------------------------------------------------------------------
// Panden-module helpers
// ---------------------------------------------------------------------------

export const PAND_TYPE_LABELS = {
  woning: "Woning",
  appartement: "Appartement",
  kantoor: "Kantoor",
  bedrijfspand: "Bedrijfspand",
  zorginstelling: "Zorginstelling",
  school: "School",
  sportaccommodatie: "Sportaccommodatie",
  overig: "Overig",
};

export function pandTypeLabel(code) {
  return PAND_TYPE_LABELS[code] ?? code;
}

export const EIGENAAR_TYPE_LABELS = {
  eigenaar_bewoner: "Eigenaar-bewoner",
  particulier_verhuurder: "Particulier verhuurder",
  zakelijk_verhuurder: "Zakelijk verhuurder",
  vve: "VvE",
  overig: "Overig",
};

export function eigenaarTypeLabel(code) {
  return EIGENAAR_TYPE_LABELS[code] ?? code;
}

export const MAATREGEL_TYPE_LABELS = {
  warmtepomp_lucht_water: "Warmtepomp lucht/water",
  warmtepomp_water_water: "Warmtepomp water/water",
  warmtepomp_hybride: "Warmtepomp hybride",
  dakisolatie: "Dakisolatie",
  gevelisolatie: "Gevelisolatie",
  vloerisolatie: "Vloerisolatie",
  hr_glas: "HR++ glas",
  zonneboiler: "Zonneboiler",
  eia_investering: "EIA-investering",
  mia_vamil_investering: "MIA/Vamil-investering",
  dumava_maatregel: "DUMAVA-maatregel",
};

export function maatregelTypeLabel(code) {
  return MAATREGEL_TYPE_LABELS[code] ?? code;
}

export const MAATREGEL_STATUS_LABELS = {
  orientatie: "Oriëntatie",
  gepland: "Gepland",
  uitgevoerd: "Uitgevoerd",
  aangevraagd: "Aangevraagd",
  goedgekeurd: "Goedgekeurd",
  afgewezen: "Afgewezen",
};

export function maatregelStatusLabel(code) {
  return MAATREGEL_STATUS_LABELS[code] ?? code;
}

// kleur-tokens, passen bij het groene thema
export function deadlineStatusTone(status) {
  switch (status) {
    case "kritiek":
    case "verlopen":
      return "bg-red-50 text-red-800 border-red-200";
    case "waarschuwing":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "ok":
      return "bg-brand-greenLight text-brand-greenDark border-brand-green/30";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export function deadlineStatusLabel(status) {
  switch (status) {
    case "ok":
      return "Op schema";
    case "waarschuwing":
      return "Waarschuwing";
    case "kritiek":
      return "Kritiek";
    case "verlopen":
      return "Verlopen";
    default:
      return "—";
  }
}

export function energielabelTone(label) {
  const tones = {
    A: "bg-green-100 text-green-900 border-green-200",
    B: "bg-lime-100 text-lime-900 border-lime-200",
    C: "bg-yellow-100 text-yellow-900 border-yellow-200",
    D: "bg-amber-100 text-amber-900 border-amber-200",
    E: "bg-orange-100 text-orange-900 border-orange-200",
    F: "bg-red-100 text-red-900 border-red-200",
    G: "bg-rose-200 text-rose-900 border-rose-300",
  };
  return tones[label] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

export function formatAdres(pand) {
  if (!pand) return "";
  const line1 = [pand.straat, pand.huisnummer].filter(Boolean).join(" ");
  const line2 = [pand.postcode, pand.plaats].filter(Boolean).join(" ");
  return line2 ? `${line1}, ${line2}` : line1;
}
