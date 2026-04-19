import { useMemo, useState } from "react";

import PageMeta from "../components/PageMeta.jsx";
import Step1Type from "./subsidiecheck/Step1Type.jsx";
import Step2Maatregelen from "./subsidiecheck/Step2Maatregelen.jsx";
import Step3Pand from "./subsidiecheck/Step3Pand.jsx";
import Step4Investering from "./subsidiecheck/Step4Investering.jsx";
import Step5Resultaat from "./subsidiecheck/Step5Resultaat.jsx";
import WizardShell from "./subsidiecheck/WizardShell.jsx";

const EMPTY_STATE = {
  type_aanvrager: null,
  maatregelen: [],
  pand: { postcode: "", bouwjaar: "", energielabel: "", type_pand: null },
  investering: {
    investering_bedrag: "",
    offerte_beschikbaar: false,
    gewenste_startdatum: "",
  },
};

export default function SubsidieCheck() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState(EMPTY_STATE);

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(state.type_aanvrager);
    if (step === 2) return state.maatregelen.length > 0;
    if (step === 3) return true;
    if (step === 4) return true;
    return true;
  }, [step, state]);

  const payload = useMemo(() => {
    const body = {
      type_aanvrager: state.type_aanvrager,
      maatregelen: state.maatregelen,
      offerte_beschikbaar: state.investering.offerte_beschikbaar === true,
    };
    const pc = state.pand.postcode?.trim();
    if (pc) body.postcode = pc;
    if (state.pand.bouwjaar !== "" && state.pand.bouwjaar !== null) {
      body.bouwjaar = Number(state.pand.bouwjaar);
    }
    if (state.pand.energielabel) body.energielabel = state.pand.energielabel;
    if (state.pand.type_pand) body.type_pand = state.pand.type_pand;
    if (
      state.investering.investering_bedrag !== "" &&
      state.investering.investering_bedrag !== null
    ) {
      body.investering_bedrag = Number(state.investering.investering_bedrag);
    }
    if (state.investering.gewenste_startdatum) {
      body.gewenste_startdatum = state.investering.gewenste_startdatum;
    }
    return body;
  }, [state]);

  function onNext() {
    if (!canContinue) return;
    setStep((s) => Math.min(5, s + 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }
  function onBack() {
    setStep((s) => Math.max(1, s - 1));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  return (
    <>
      <PageMeta
        title="Subsidiecheck"
        description="Doe in 5 stappen de gratis AAA-Subsidies subsidiecheck en ontdek welke regelingen op uw situatie van toepassing zijn."
      />
      <WizardShell
      step={step}
      totalSteps={5}
      canContinue={canContinue}
      isLastStep={step === 5}
      hideNav={step === 5}
      onBack={onBack}
      onNext={onNext}
    >
      {step === 1 && (
        <Step1Type
          value={state.type_aanvrager}
          onChange={(v) => setState((s) => ({ ...s, type_aanvrager: v }))}
        />
      )}
      {step === 2 && (
        <Step2Maatregelen
          value={state.maatregelen}
          onChange={(v) => setState((s) => ({ ...s, maatregelen: v }))}
        />
      )}
      {step === 3 && (
        <Step3Pand
          value={state.pand}
          onChange={(v) => setState((s) => ({ ...s, pand: v }))}
        />
      )}
      {step === 4 && (
        <Step4Investering
          value={state.investering}
          onChange={(v) => setState((s) => ({ ...s, investering: v }))}
        />
      )}
      {step === 5 && (
        <>
          <Step5Resultaat payload={payload} />
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Terug
            </button>
            <button
              type="button"
              onClick={() => {
                setState(EMPTY_STATE);
                setStep(1);
                if (typeof window !== "undefined") window.scrollTo({ top: 0 });
              }}
              className="text-sm font-semibold text-brand-green hover:underline"
            >
              Opnieuw invullen
            </button>
          </div>
        </>
      )}
    </WizardShell>
    </>
  );
}
