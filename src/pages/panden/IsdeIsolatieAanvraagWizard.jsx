import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import PageMeta from "../../components/PageMeta.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import { formatDate, formatEuro } from "../../lib/formatters.js";
import {
  getPand,
  maatregelLabel,
  submitIsdeIsolatieAanvraag,
} from "../../lib/panden.js";

const FEE_PCT = 8;

const ISOLATIE_TYPES = [
  {
    id: "dakisolatie",
    icon: "🏠",
    label: "Dakisolatie",
    range: "± €500 - €3.000",
    ratePerM2: 16.25,
    cap: 3000,
    minM2: 0,
    oppervlakteHelper:
      "Het totale dakoppervlak dat geïsoleerd wordt",
  },
  {
    id: "gevelisolatie",
    icon: "🏗",
    label: "Gevelisolatie",
    range: "± €400 - €2.500",
    ratePerM2: 14.5,
    cap: 2500,
    minM2: 0,
    oppervlakteHelper: "Het totale geveloppervlak dat geïsoleerd wordt",
  },
  {
    id: "vloerisolatie",
    icon: "🏔",
    label: "Vloerisolatie",
    range: "± €300 - €1.500",
    ratePerM2: 12,
    cap: 1500,
    minM2: 0,
    oppervlakteHelper: "Het totale vloeroppervlak dat geïsoleerd wordt",
  },
  {
    id: "hr_glas",
    icon: "🪟",
    label: "HR++ glas",
    range: "± €300 - €2.000",
    ratePerM2: 65,
    cap: 2000,
    minM2: 3,
    oppervlakteHelper: "Minimaal 3m² vereist voor ISDE",
  },
];

function metaFor(id) {
  return ISOLATIE_TYPES.find((t) => t.id === id);
}

function subsidyFromM2(id, m2Raw) {
  const meta = metaFor(id);
  if (!meta) return 0;
  const m2 = Number(String(m2Raw).replace(",", "."));
  if (!m2 || m2 <= 0) return 0;
  const raw = Math.round(m2 * meta.ratePerM2 * 100) / 100;
  return Math.min(raw, meta.cap);
}

function deadlineNaInstallatie(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth() + 24);
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function emptyDetail() {
  return {
    oppervlakte: "",
    meldcode: "",
    alUitgevoerd: false,
    uitvoeringsdatum: "",
  };
}

export default function IsdeIsolatieAanvraagWizard() {
  const { pandId } = useParams();
  const navigate = useNavigate();
  const [pand, setPand] = useState(null);
  const [loadErr, setLoadErr] = useState(null);
  const [phase, setPhase] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [details, setDetails] = useState({});
  const [uitvoerderNaam, setUitvoerderNaam] = useState("");
  const [uitvoerderKvk, setUitvoerderKvk] = useState("");
  const [geplandeDatum, setGeplandeDatum] = useState("");
  const [investering, setInvestering] = useState({});
  const [submitErr, setSubmitErr] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getPand(pandId);
        if (!cancelled) {
          setPand(data);
          setLoadErr(null);
        }
      } catch (e) {
        if (!cancelled) setLoadErr(apiErrorMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pandId]);

  const adresLabel = pand
    ? `${pand.straat} ${pand.huisnummer}, ${pand.postcode} ${pand.plaats}`
    : "…";

  function toggleType(id) {
    setSelectedTypes((prev) => {
      if (prev.includes(id)) {
        setDetails((d) => {
          const next = { ...d };
          delete next[id];
          return next;
        });
        setInvestering((inv) => {
          const next = { ...inv };
          delete next[id];
          return next;
        });
        return prev.filter((x) => x !== id);
      }
      setDetails((d) => ({ ...d, [id]: emptyDetail() }));
      setInvestering((inv) => ({ ...inv, [id]: "" }));
      return [...prev, id];
    });
  }

  function setDetail(id, field, value) {
    setDetails((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || emptyDetail()), [field]: value },
    }));
  }

  const totaalSubsidieStap2 = useMemo(() => {
    return selectedTypes.reduce(
      (sum, id) => sum + subsidyFromM2(id, details[id]?.oppervlakte),
      0,
    );
  }, [selectedTypes, details]);

  const totaalInvesteringStap4 = useMemo(() => {
    return selectedTypes.reduce((sum, id) => {
      const v = investering[id];
      if (!v) return sum;
      const n = Number(String(v).replace(",", "."));
      return sum + (Number.isNaN(n) ? 0 : n);
    }, 0);
  }, [selectedTypes, investering]);

  const totaalSubsidieStap4 = useMemo(
    () =>
      selectedTypes.reduce(
        (sum, id) => sum + subsidyFromM2(id, details[id]?.oppervlakte),
        0,
      ),
    [selectedTypes, details],
  );

  const feeStap4 =
    totaalSubsidieStap4 > 0
      ? Math.round(totaalSubsidieStap4 * (FEE_PCT / 100) * 100) / 100
      : 0;
  const nettoStap4 =
    totaalSubsidieStap4 > 0
      ? Math.round((totaalSubsidieStap4 - feeStap4) * 100) / 100
      : 0;

  function goBack() {
    setSubmitErr(null);
    if (phase === "done") return;
    if (phase === 5) setPhase(4);
    else if (phase === 4) setPhase(3);
    else if (phase === 3) setPhase(2);
    else if (phase === 2) setPhase(1);
    else navigate(`/panden/${pandId}`);
  }

  function validateStep1() {
    if (selectedTypes.length === 0) {
      alert("Selecteer minstens één isolatietype.");
      return false;
    }
    return true;
  }

  function validateStep2() {
    for (const id of selectedTypes) {
      const d = details[id] || emptyDetail();
      const m2 = Number(String(d.oppervlakte).replace(",", "."));
      const meta = metaFor(id);
      if (!m2 || m2 <= 0) {
        alert(`Vul een geldige oppervlakte in voor ${meta?.label || id}.`);
        return false;
      }
      if (meta?.minM2 && m2 < meta.minM2) {
        alert(`${meta.label} vereist minimaal ${meta.minM2} m² voor ISDE.`);
        return false;
      }
      if (d.alUitgevoerd && !d.uitvoeringsdatum) {
        alert(`Vul de uitvoeringsdatum in voor ${meta?.label || id}.`);
        return false;
      }
    }
    return true;
  }

  function validateStep3() {
    if (!uitvoerderNaam.trim()) {
      alert("Vul de naam van het isolatiebedrijf in.");
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    setSubmitErr(null);
    setSubmitting(true);
    try {
      const items = selectedTypes.map((id) => {
        const d = details[id] || emptyDetail();
        return {
          maatregel_type: id,
          oppervlakte_m2: Number(String(d.oppervlakte).replace(",", ".")),
          meldcode_materiaal: d.meldcode.trim() || null,
          al_uitgevoerd: Boolean(d.alUitgevoerd),
          uitvoeringsdatum:
            d.alUitgevoerd && d.uitvoeringsdatum ? d.uitvoeringsdatum : null,
          investering_bedrag: investering[id]
            ? Number(String(investering[id]).replace(",", "."))
            : null,
        };
      });
      const body = {
        items,
        installateur_naam: uitvoerderNaam.trim(),
        installateur_kvk: uitvoerderKvk.trim() || null,
        installatie_of_geplande_datum: geplandeDatum || null,
      };
      const list = await submitIsdeIsolatieAanvraag(pandId, body);
      setCreated(list);
      setPhase("done");
    } catch (e) {
      setSubmitErr(apiErrorMessage(e, "Indienen mislukt"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadErr) {
    return (
      <div className="container-app py-10">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {loadErr}
        </div>
        <Link
          to={`/panden/${pandId}`}
          className="mt-4 inline-block text-sm font-semibold text-brand-green hover:underline"
        >
          ← Terug naar pand
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8 sm:py-10">
      <PageMeta title="ISDE isolatie aanvraag" />

      <nav className="text-xs text-gray-500 sm:text-sm">
        <Link to="/panden" className="font-semibold text-brand-green hover:underline">
          Mijn panden
        </Link>
        <span className="mx-2 text-gray-300">→</span>
        <Link
          to={`/panden/${pandId}`}
          className="font-semibold text-brand-green hover:underline"
        >
          {adresLabel}
        </Link>
        <span className="mx-2 text-gray-300">→</span>
        <span className="font-semibold text-gray-800">
          ISDE isolatie aanvraag
        </span>
      </nav>

      {phase !== "done" && (
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
            <span>Stap {phase} van 5</span>
            <span>{Math.round((phase / 5) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-brand-green transition-all duration-300"
              style={{ width: `${(phase / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-8">
        {phase === 1 && (
          <Step1Types
            selectedTypes={selectedTypes}
            toggleType={toggleType}
            onNext={() => validateStep1() && setPhase(2)}
          />
        )}
        {phase === 2 && (
          <Step2Details
            selectedTypes={selectedTypes}
            details={details}
            setDetail={setDetail}
            totaalSubsidie={totaalSubsidieStap2}
            onNext={() => validateStep2() && setPhase(3)}
          />
        )}
        {phase === 3 && (
          <Step3Uitvoerder
            uitvoerderNaam={uitvoerderNaam}
            setUitvoerderNaam={setUitvoerderNaam}
            uitvoerderKvk={uitvoerderKvk}
            setUitvoerderKvk={setUitvoerderKvk}
            geplandeDatum={geplandeDatum}
            setGeplandeDatum={setGeplandeDatum}
            onNext={() => validateStep3() && setPhase(4)}
          />
        )}
        {phase === 4 && (
          <Step4Financieel
            selectedTypes={selectedTypes}
            investering={investering}
            setInvestering={(id, v) =>
              setInvestering((prev) => ({ ...prev, [id]: v }))
            }
            totaalInvestering={totaalInvesteringStap4}
            totaalSubsidie={totaalSubsidieStap4}
            fee={feeStap4}
            netto={nettoStap4}
            onNext={() => setPhase(5)}
          />
        )}
        {phase === 5 && (
          <Step5Confirm
            selectedTypes={selectedTypes}
            details={details}
            uitvoerderNaam={uitvoerderNaam}
            totaalSubsidie={totaalSubsidieStap4}
            geplandeDatum={geplandeDatum}
            submitErr={submitErr}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        )}
        {phase === "done" && created && (
          <StepDone created={created} pandId={pandId} />
        )}
      </div>

      {phase !== "done" && (
        <div className="mt-10">
          <button
            type="button"
            onClick={goBack}
            className="text-sm font-semibold text-gray-600 hover:text-brand-green"
          >
            ← Terug
          </button>
        </div>
      )}
    </div>
  );
}

function Step1Types({ selectedTypes, toggleType, onNext }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Welke isolatie wilt u laten uitvoeren?
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        U kunt meerdere types tegelijk selecteren (vinkje bij selectie).
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {ISOLATIE_TYPES.map((t) => {
          const sel = selectedTypes.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggleType(t.id)}
              className={`relative flex flex-col rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                sel
                  ? "border-brand-green bg-brand-greenLight shadow-md ring-2 ring-brand-green/20"
                  : "border-gray-200 bg-white hover:border-brand-green/40"
              }`}
            >
              {sel && (
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
                  ✓
                </span>
              )}
              <span className="text-2xl" aria-hidden="true">
                {t.icon}
              </span>
              <span className="mt-2 text-lg font-extrabold text-gray-900">
                {t.label}
              </span>
              <span className="mt-1 text-xs font-semibold text-brand-green">
                {t.range}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <strong className="font-extrabold">Tip:</strong> Combineert u
        isolatie met een warmtepomp? Dan ontvangt u per maatregel het hogere
        subsidiebedrag. Vraag AAA-Lex naar de combinatiemogelijkheden.
      </div>
      <div className="mt-8 flex justify-end">
        <button type="button" onClick={onNext} className="btn-primary">
          Volgende stap
        </button>
      </div>
    </div>
  );
}

function Step2Details({
  selectedTypes,
  details,
  setDetail,
  totaalSubsidie,
  onNext,
}) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Oppervlakte en details
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Vul per geselecteerd type de gegevens in.
      </p>
      <div className="mt-8 space-y-10">
        {selectedTypes.map((id) => {
          const meta = metaFor(id);
          const d = details[id] || emptyDetail();
          const live = subsidyFromM2(id, d.oppervlakte);
          return (
            <section
              key={id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-extrabold text-gray-900">
                {meta?.label} details
              </h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 inline-block font-semibold text-gray-800">
                    Oppervlakte in m² <span className="text-red-600">*</span>
                  </span>
                  <input
                    type="number"
                    min={meta?.minM2 ? meta.minM2 : 0}
                    step="0.01"
                    className="input"
                    value={d.oppervlakte}
                    onChange={(e) => setDetail(id, "oppervlakte", e.target.value)}
                  />
                  <span className="mt-1 block text-xs text-gray-500">
                    {meta?.oppervlakteHelper}
                  </span>
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1 inline-block font-semibold text-gray-800">
                    Meldcode materiaal{" "}
                    <span className="font-normal text-gray-400">(optioneel)</span>
                  </span>
                  <input
                    className="input"
                    value={d.meldcode}
                    onChange={(e) => setDetail(id, "meldcode", e.target.value)}
                  />
                  <span className="mt-1 block text-xs text-gray-500">
                    Staat op de factuur van het isolatiemateriaal
                  </span>
                </label>
                <div className="sm:col-span-2">
                  <span className="text-sm font-semibold text-gray-800">
                    Is de isolatie al uitgevoerd?
                  </span>
                  <div className="mt-2 inline-flex rounded-lg border border-gray-200 p-1">
                    <button
                      type="button"
                      onClick={() => setDetail(id, "alUitgevoerd", false)}
                      className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                        !d.alUitgevoerd
                          ? "bg-brand-green text-white"
                          : "text-gray-600"
                      }`}
                    >
                      Nee
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetail(id, "alUitgevoerd", true)}
                      className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                        d.alUitgevoerd
                          ? "bg-brand-green text-white"
                          : "text-gray-600"
                      }`}
                    >
                      Ja
                    </button>
                  </div>
                  {d.alUitgevoerd && (
                    <label className="mt-3 block text-sm">
                      <span className="mb-1 inline-block font-semibold text-gray-800">
                        Uitvoeringsdatum
                      </span>
                      <input
                        type="date"
                        className="input max-w-xs"
                        value={d.uitvoeringsdatum}
                        onChange={(e) =>
                          setDetail(id, "uitvoeringsdatum", e.target.value)
                        }
                      />
                    </label>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold text-brand-green">
                Geschat voor dit type: ± {formatEuro(live || 0)}
              </p>
            </section>
          );
        })}
      </div>
      <div className="mt-6 rounded-xl border border-brand-green/30 bg-brand-greenLight px-4 py-3 text-sm font-bold text-brand-greenDark">
        Totaal geschatte subsidie: ± {formatEuro(totaalSubsidie)}
      </div>
      <div className="mt-8 flex justify-end">
        <button type="button" onClick={onNext} className="btn-primary">
          Volgende stap
        </button>
      </div>
    </div>
  );
}

function Step3Uitvoerder({
  uitvoerderNaam,
  setUitvoerderNaam,
  uitvoerderKvk,
  setUitvoerderKvk,
  geplandeDatum,
  setGeplandeDatum,
  onNext,
}) {
  const dl = deadlineNaInstallatie(geplandeDatum);
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Wie voert de isolatie uit?
      </h1>
      <div className="mt-8 max-w-xl space-y-6">
        <label className="block text-sm">
          <span className="mb-1 inline-block font-semibold text-gray-800">
            Naam isolatiebedrijf <span className="text-red-600">*</span>
          </span>
          <input
            className="input"
            value={uitvoerderNaam}
            onChange={(e) => setUitvoerderNaam(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 inline-block font-semibold text-gray-800">
            KvK-nummer{" "}
            <span className="font-normal text-gray-400">(optioneel)</span>
          </span>
          <input
            className="input"
            value={uitvoerderKvk}
            onChange={(e) => setUitvoerderKvk(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 inline-block font-semibold text-gray-800">
            Installatiedatum / geplande datum
          </span>
          <input
            type="date"
            className="input"
            value={geplandeDatum}
            onChange={(e) => setGeplandeDatum(e.target.value)}
          />
          {dl && (
            <p className="mt-3 rounded-md border border-brand-green/30 bg-brand-greenLight px-3 py-2 text-sm font-semibold text-brand-greenDark">
              Deadline aanvragen: {dl}
            </p>
          )}
        </label>
      </div>
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <strong className="font-extrabold">Belangrijk:</strong> maak foto&apos;s
        TIJDENS de werkzaamheden. U heeft per isolatiemaatregel één foto nodig
        waarop het isolatiemateriaal (naam, merk en dikte) zichtbaar is.
        AAA-Lex heeft deze foto&apos;s nodig voor de aanvraag.
      </div>
      <div className="mt-8 flex justify-end">
        <button type="button" onClick={onNext} className="btn-primary">
          Volgende stap
        </button>
      </div>
    </div>
  );
}

function Step4Financieel({
  selectedTypes,
  investering,
  setInvestering,
  totaalInvestering,
  totaalSubsidie,
  fee,
  netto,
  onNext,
}) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Wat zijn de kosten?
      </h1>
      <div className="mt-8 space-y-6">
        {selectedTypes.map((id) => {
          const meta = metaFor(id);
          return (
            <label key={id} className="block max-w-xl text-sm">
              <span className="mb-1 inline-block font-semibold text-gray-800">
                Investering — {meta?.label} (€)
              </span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  €
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input pl-8"
                  value={investering[id] ?? ""}
                  onChange={(e) => setInvestering(id, e.target.value)}
                  placeholder="0"
                />
              </div>
            </label>
          );
        })}
      </div>
      <div className="mt-8 max-w-xl rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-gray-600">Totale investering</span>
          <span className="font-bold text-gray-900">
            {formatEuro(totaalInvestering)}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-600">Totale geschatte subsidie</span>
          <span className="font-bold text-brand-green">
            ± {formatEuro(totaalSubsidie)}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-600">AAA-Lex fee ({FEE_PCT}%)</span>
          <span className="font-semibold text-gray-800">
            {formatEuro(fee)}
          </span>
        </div>
        <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-extrabold text-brand-green">
          <span>U ontvangt netto</span>
          <span>± {formatEuro(netto)}</span>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          Schatting op basis van officiële RVO tarieven. Definitief bedrag na
          RVO beoordeling.
        </p>
      </div>
      <div className="mt-8 flex justify-end">
        <button type="button" onClick={onNext} className="btn-primary">
          Volgende stap
        </button>
      </div>
    </div>
  );
}

function Step5Confirm({
  selectedTypes,
  details,
  uitvoerderNaam,
  totaalSubsidie,
  geplandeDatum,
  submitErr,
  submitting,
  onSubmit,
}) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Bevestig uw aanvraag
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        We leggen per isolatietype een apart dossier aan bij AAA-Lex.
      </p>
      <ul className="mt-6 max-w-xl space-y-3 rounded-xl border border-gray-100 bg-white p-5 text-sm shadow-sm">
        {selectedTypes.map((id) => {
          const d = details[id] || emptyDetail();
          const sub = subsidyFromM2(id, d.oppervlakte);
          return (
            <li
              key={id}
              className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
            >
              <div className="font-extrabold text-gray-900">
                {maatregelLabel(id)}
              </div>
              <div className="mt-1 text-xs text-gray-600">
                {d.oppervlakte} m²
                {d.alUitgevoerd ? " · reeds uitgevoerd" : ""}
              </div>
              <div className="mt-1 text-xs font-semibold text-brand-green">
                ± {formatEuro(sub)}
              </div>
            </li>
          );
        })}
        <li className="flex justify-between pt-2">
          <span className="text-gray-500">Uitvoerder</span>
          <span className="font-semibold text-gray-900">{uitvoerderNaam}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-gray-500">Datum (gepland / algemeen)</span>
          <span className="font-semibold text-gray-900">
            {geplandeDatum ? formatDate(geplandeDatum) : "—"}
          </span>
        </li>
        <li className="flex justify-between border-t border-gray-100 pt-2">
          <span className="text-gray-500">Totaal geschatte subsidie</span>
          <span className="font-bold text-brand-green">
            ± {formatEuro(totaalSubsidie)}
          </span>
        </li>
      </ul>
      {submitErr && (
        <div className="mt-4 max-w-xl rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {submitErr}
        </div>
      )}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="btn-primary"
        >
          {submitting ? "Bezig…" : "Aanvraag indienen bij AAA-Lex"}
        </button>
      </div>
    </div>
  );
}

function StepDone({ created, pandId }) {
  const totaalSub = created.reduce(
    (s, m) => s + (m.geschatte_subsidie || 0),
    0,
  );
  return (
    <div className="mx-auto max-w-lg text-center">
      <div
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-greenLight wizard-check-pop"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 48 48"
          className="h-14 w-14 text-brand-green"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 24l9 9 15-18" />
        </svg>
      </div>
      <h1 className="mt-8 text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Uw aanvraag is ingediend bij AAA-Lex
      </h1>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 text-left text-sm shadow-sm">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-gray-500">
          Aangemaakte dossiers ({created.length})
        </h2>
        <ul className="mt-3 space-y-3">
          {created.map((m) => (
            <li key={m.id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="font-semibold text-gray-900">
                {maatregelLabel(m.maatregel_type)}
              </div>
              <div className="mt-1 text-xs text-gray-600">
                Geschatte subsidie:{" "}
                <span className="font-semibold text-brand-green">
                  {m.geschatte_subsidie != null
                    ? formatEuro(m.geschatte_subsidie)
                    : "—"}
                </span>
              </div>
              <div className="mt-1 text-xs text-gray-600">
                Deadline:{" "}
                {m.deadline_indienen
                  ? formatDate(m.deadline_indienen)
                  : "—"}
              </div>
              <Link
                to={`/panden/${pandId}/maatregelen/${m.id}`}
                className="mt-2 inline-block text-xs font-semibold text-brand-green hover:underline"
              >
                Bekijk dossier →
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-600">
          Totaal geschatte subsidie (alle types):{" "}
          <span className="font-bold text-brand-green">
            {formatEuro(totaalSub)}
          </span>
        </p>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-gray-700">
        AAA-Lex neemt uw aanvragen in behandeling. Wij nemen binnen 2
        werkdagen contact met u op om de volgende stappen te bespreken.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/panden" className="btn-secondary sm:!px-8">
          Terug naar pand overzicht
        </Link>
        <Link to={`/panden/${pandId}`} className="btn-primary sm:!px-8">
          Nog een maatregel toevoegen
        </Link>
      </div>
    </div>
  );
}
