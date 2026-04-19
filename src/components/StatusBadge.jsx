const STATUS_META = {
  intake: {
    label: "Intake",
    classes: "bg-gray-100 text-gray-800 ring-gray-200",
  },
  documenten: {
    label: "Documenten",
    classes: "bg-blue-50 text-blue-800 ring-blue-200",
  },
  review: {
    label: "Review",
    classes: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  ingediend: {
    label: "Ingediend",
    classes: "bg-purple-50 text-purple-800 ring-purple-200",
  },
  goedgekeurd: {
    label: "Goedgekeurd",
    classes: "bg-green-50 text-green-800 ring-green-200",
  },
  afgewezen: {
    label: "Afgewezen",
    classes: "bg-red-50 text-red-800 ring-red-200",
  },
};

export default function StatusBadge({ status, className = "" }) {
  const meta = STATUS_META[status] ?? {
    label: status ?? "Onbekend",
    classes: "bg-gray-100 text-gray-800 ring-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.classes} ${className}`}
    >
      {meta.label}
    </span>
  );
}

export function RegelingBadge({ code, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-brand-green px-2 py-1 text-xs font-bold uppercase tracking-wide text-white ${className}`}
    >
      {code}
    </span>
  );
}
