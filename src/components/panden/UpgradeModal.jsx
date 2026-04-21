import { Link } from "react-router-dom";

const PLAN_LABELS = {
  gratis: "Gratis",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

export default function UpgradeModal({ info, onClose }) {
  if (!info) return null;
  const planLabel = PLAN_LABELS[info.plan] ?? info.plan;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="upgrade-title" className="text-xl font-bold text-gray-900">
          Pandlimiet bereikt
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">
          Uw huidige {planLabel}-plan staat <strong>{info.limit} panden</strong>{" "}
          toe. U heeft er al <strong>{info.current}</strong> in beheer. Upgrade
          voor meer panden en extra functies.
        </p>
        <div className="mt-5 rounded-lg border border-brand-green/20 bg-brand-greenLight/60 p-4 text-sm text-gray-800">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-green">
            Meer panden nodig?
          </div>
          <ul className="mt-2 space-y-1.5">
            <li>
              <strong>Starter</strong> — tot 30 panden, ideaal voor kleine
              verhuurders.
            </li>
            <li>
              <strong>Pro</strong> — tot 100 panden, inclusief prioriteit-support.
            </li>
            <li>
              <strong>Enterprise</strong> — onbeperkt, op maat voor VvE's en
              beheerders.
            </li>
          </ul>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn-secondary !px-5 !py-2.5 text-sm"
            onClick={onClose}
          >
            Later
          </button>
          <Link
            to="/onboarding/plan"
            className="btn-primary !px-5 !py-2.5 text-sm"
            onClick={onClose}
          >
            Bekijk plannen
          </Link>
        </div>
      </div>
    </div>
  );
}
