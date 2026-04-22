import { formatDate } from "../../lib/formatters.js";

function stepDate(d) {
  if (!d) return null;
  try {
    return formatDate(d);
  } catch {
    return null;
  }
}

/**
 * Vaste klant-tijdlijn (geen technische RVO-details).
 */
export default function MaatregelStatusTimeline({ maatregel }) {
  const status = maatregel.status;
  const created = maatregel.created_at;
  const updated = maatregel.updated_at;
  const deadline = maatregel.deadline_indienen;

  const ingediendStatuses = new Set([
    "aangevraagd",
    "in_beoordeling",
    "goedgekeurd",
    "afgewezen",
  ]);
  const besluitStatuses = new Set(["goedgekeurd", "afgewezen"]);

  const steps = [
    {
      key: "ontvangen",
      label: "Aanvraag ontvangen",
      done: true,
      date: created,
    },
    {
      key: "behandeling",
      label: "Dossier in behandeling",
      done: status !== "orientatie",
      date: status !== "orientatie" ? updated : null,
    },
    {
      key: "ingediend",
      label: "Ingediend bij RVO",
      done: ingediendStatuses.has(status),
      date: ingediendStatuses.has(status) ? updated : null,
      hint: deadline
        ? `Verwacht rond: ${formatDate(deadline)}`
        : "AAA-Lex plant de indiening met u",
    },
    {
      key: "besluit",
      label: "Besluit RVO",
      done: besluitStatuses.has(status),
      date: besluitStatuses.has(status) ? updated : null,
      hint: "Binnen 13 weken na indiening",
    },
    {
      key: "uitbetaling",
      label: "Subsidie ontvangen",
      done: status === "goedgekeurd",
      date: status === "goedgekeurd" ? updated : null,
      hint: "Na goedkeuring volgt uitbetaling via RVO",
    },
  ];

  let currentIdx = steps.findIndex((s) => !s.done);
  if (currentIdx === -1) currentIdx = steps.length - 1;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Voortgang</h2>
      <ul className="mt-4 space-y-4">
        {steps.map((step, i) => {
          const isCurrent = i === currentIdx;
          const bullet = step.done ? "✓" : isCurrent ? "●" : "○";
          return (
            <li key={step.key} className="flex gap-3">
              <div
                className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm font-extrabold ${
                  isCurrent
                    ? "bg-brand-green text-white shadow-md shadow-brand-green/30"
                    : step.done
                      ? "bg-brand-greenLight text-brand-greenDark"
                      : "border border-gray-200 bg-gray-50 text-gray-400"
                }`}
                aria-hidden
              >
                {bullet}
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-semibold ${
                    isCurrent ? "text-brand-green" : "text-gray-900"
                  }`}
                >
                  {step.label}
                </div>
                {stepDate(step.date) && (
                  <div className="text-xs text-gray-500">{stepDate(step.date)}</div>
                )}
                {step.hint && (
                  <div className="mt-0.5 text-xs text-gray-500">{step.hint}</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
