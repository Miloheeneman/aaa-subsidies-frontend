import { DEADLINE_COLORS, DEADLINE_LABELS } from "../../lib/panden.js";
import { formatDate, daysUntil } from "../../lib/formatters.js";

export default function DeadlineBadge({ status, datum, size = "sm" }) {
  if (!status && !datum) {
    return <span className="text-sm text-gray-400">—</span>;
  }
  const effective = status || "ok";
  const color =
    DEADLINE_COLORS[effective] ||
    "bg-gray-100 text-gray-700 border-gray-200";
  const label = DEADLINE_LABELS[effective] || effective;
  const dagen = datum ? daysUntil(datum) : null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-semibold ${
        size === "md" ? "text-sm" : "text-xs"
      } ${color}`}
      title={datum ? `Deadline: ${formatDate(datum)}` : undefined}
    >
      {label}
      {datum && (
        <span className="opacity-70">
          · {formatDate(datum)}
          {dagen !== null && dagen >= 0 && ` · nog ${dagen} dagen`}
          {dagen !== null && dagen < 0 && ` · ${Math.abs(dagen)} dagen over`}
        </span>
      )}
    </span>
  );
}

export function EnergielabelBadge({ label }) {
  if (!label) {
    return (
      <span className="inline-flex items-center rounded-md border border-dashed border-gray-300 px-2 py-0.5 text-xs font-semibold text-gray-400">
        Niet ingevuld
      </span>
    );
  }
  const palette = {
    A: "bg-brand-greenLight text-brand-greenDark border-brand-green/40",
    B: "bg-lime-50 text-lime-800 border-lime-200",
    C: "bg-yellow-50 text-yellow-800 border-yellow-200",
    D: "bg-orange-50 text-orange-800 border-orange-200",
    E: "bg-orange-100 text-orange-900 border-orange-300",
    F: "bg-red-50 text-red-800 border-red-200",
    G: "bg-red-100 text-red-900 border-red-300",
  };
  const tone =
    palette[String(label).toUpperCase()] ||
    "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md border text-sm font-extrabold ${tone}`}
      aria-label={`Energielabel ${label}`}
    >
      {String(label).toUpperCase()}
    </span>
  );
}
