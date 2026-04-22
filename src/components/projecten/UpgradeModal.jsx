import { useNavigate } from "react-router-dom";

/**
 * Shown when the user tries to create a project past their plan limit.
 * Parent decides when to open/close via the ``open`` + ``onClose`` props.
 */
export default function UpgradeModal({ open, onClose, quota }) {
  const navigate = useNavigate();
  if (!open) return null;
  const plan = quota?.plan || "gratis";
  const limit = quota?.limit ?? null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-extrabold text-gray-900">
          Projectlimiet bereikt
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Uw huidige <span className="font-semibold">{plan}</span>-plan staat{" "}
          <span className="font-semibold">{limit ?? "onbeperkt"}</span> projecten
          toe. Upgrade voor meer projecten en extra functies.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary !py-2 !px-4 text-sm"
          >
            Later
          </button>
          <button
            type="button"
            onClick={() => navigate("/onboarding/plan")}
            className="btn-primary !py-2 !px-4 text-sm"
          >
            Bekijk plannen
          </button>
        </div>
      </div>
    </div>
  );
}
