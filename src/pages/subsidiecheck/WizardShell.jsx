import ProgressBar from "./ProgressBar.jsx";

const STEP_TITLES = [
  "Wie bent u?",
  "Welke maatregel wilt u nemen?",
  "Over uw pand",
  "Over uw investering",
  "Uw subsidiemogelijkheden",
];

export default function WizardShell({
  step,
  totalSteps = 5,
  onBack,
  onNext,
  canContinue = true,
  isLastStep = false,
  nextLabel,
  hideNav = false,
  children,
}) {
  const title = STEP_TITLES[step - 1] ?? "";

  return (
    <div className="bg-brand-greenLight py-8 sm:py-14 min-h-[calc(100vh-64px)]">
      <div className="container-app max-w-3xl">
        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 sm:p-10">
          <ProgressBar step={step} totalSteps={totalSteps} />

          <h1 className="mt-6 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {title}
          </h1>

          <div className="mt-6">{children}</div>

          {!hideNav && (
            <div className="mt-10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onBack}
                disabled={step === 1}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Terug
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!canContinue}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {nextLabel ?? (isLastStep ? "Voltooien" : "Volgende")}
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 px-2 text-center text-xs text-gray-500">
          Gratis subsidiecheck — geen verplichtingen. Uw gegevens worden
          alleen gebruikt om passende regelingen te vinden.
        </p>
      </div>
    </div>
  );
}
