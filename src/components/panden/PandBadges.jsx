import {
  deadlineStatusLabel,
  deadlineStatusTone,
  energielabelTone,
  maatregelStatusLabel,
} from "../../lib/formatters.js";

export function EnergielabelBadge({ label, size = "md" }) {
  if (!label) {
    return (
      <span className="inline-flex items-center rounded-md border border-dashed border-gray-300 px-2 py-0.5 text-xs text-gray-400">
        —
      </span>
    );
  }
  const sz =
    size === "lg"
      ? "h-10 w-10 text-lg"
      : size === "sm"
      ? "h-6 w-6 text-xs"
      : "h-7 w-7 text-sm";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border font-extrabold ${energielabelTone(
        label,
      )} ${sz}`}
      title={`Energielabel ${label}`}
    >
      {label}
    </span>
  );
}

export function DeadlineBadge({ status, datum, compact = false }) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600">
        Geen deadline
      </span>
    );
  }
  const tone = deadlineStatusTone(status);
  const label = deadlineStatusLabel(status);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone}`}
      title={datum ? `Deadline ${datum}` : undefined}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          status === "ok"
            ? "bg-brand-green"
            : status === "waarschuwing"
            ? "bg-amber-500"
            : status === "kritiek"
            ? "bg-red-500"
            : status === "verlopen"
            ? "bg-red-700"
            : "bg-gray-400"
        }`}
      />
      {compact ? label : `Deadline: ${label}`}
    </span>
  );
}

export function MaatregelStatusBadge({ status }) {
  const tones = {
    orientatie: "bg-gray-100 text-gray-800 border-gray-200",
    gepland: "bg-blue-50 text-blue-800 border-blue-200",
    uitgevoerd: "bg-brand-greenLight text-brand-greenDark border-brand-green/30",
    aangevraagd: "bg-indigo-50 text-indigo-800 border-indigo-200",
    goedgekeurd: "bg-green-100 text-green-900 border-green-200",
    afgewezen: "bg-red-50 text-red-800 border-red-200",
  };
  const tone = tones[status] ?? "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone}`}
    >
      {maatregelStatusLabel(status)}
    </span>
  );
}

export function RegelingPandBadge({ code }) {
  if (!code) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-brand-green/30 bg-brand-greenLight px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-brand-greenDark">
      {code}
    </span>
  );
}
