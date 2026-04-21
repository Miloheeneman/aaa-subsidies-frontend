import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../lib/api.js";

function formatEuro(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return "—";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(num);
}

function RegelingCard({ regeling }) {
  const [docsOpen, setDocsOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-md bg-brand-green px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
            {regeling.code}
          </span>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {regeling.naam}
            </div>
            <div className="text-xs text-gray-500">
              Van toepassing op uw situatie
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Geschatte subsidie
          </div>
          <div className="text-2xl font-extrabold text-brand-green">
            {formatEuro(regeling.geschatte_subsidie)}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-600">{regeling.toelichting}</p>

      {regeling.deadline_info && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <strong>Deadline:</strong> {regeling.deadline_info}
        </div>
      )}

      <div className="mt-4 grid gap-3 rounded-lg bg-gray-50 p-3 text-sm sm:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Geschatte subsidie
          </div>
          <div className="font-semibold text-gray-900">
            {formatEuro(regeling.geschatte_subsidie)}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">
            AAA-Lex fee
          </div>
          <div className="text-gray-700">
            {formatEuro(regeling.aaa_lex_fee)}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">
            U ontvangt netto
          </div>
          <div className="font-bold text-gray-900">
            {formatEuro(regeling.klant_ontvangt)}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDocsOpen((v) => !v)}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-green hover:underline"
      >
        {docsOpen ? "Verberg" : "Toon"} vereiste documenten (
        {regeling.vereiste_documenten.length})
        <span aria-hidden>{docsOpen ? "▴" : "▾"}</span>
      </button>
      {docsOpen && (
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
          {regeling.vereiste_documenten.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Step5Resultaat({ payload }) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, data: null });
    api
      .post("/subsidiecheck/bereken", payload)
      .then((res) => {
        if (!cancelled) setState({ loading: false, error: null, data: res.data });
      })
      .catch((err) => {
        if (cancelled) return;
        const detail =
          err?.response?.data?.detail ??
          "Er ging iets mis bij het berekenen. Probeer het opnieuw.";
        setState({ loading: false, error: String(detail), data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [payload]);

  if (state.loading) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-greenLight border-t-brand-green" />
        <p className="mt-4 text-gray-600">
          Uw subsidiemogelijkheden worden berekend…
        </p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {state.error}
      </div>
    );
  }

  const data = state.data;
  const applicable = data.regelingen.filter((r) => r.van_toepassing);
  const notApplicable = data.regelingen.filter((r) => !r.van_toepassing);

  // Lokale, frontend-only waarschuwing: ISDE is in principe alleen
  // beschikbaar voor woningen met bouwjaar < 2019. De backend kan dit
  // ook meegeven via waarschuwingen[] maar we tonen het hier expliciet
  // zodat de klant direct de reden ziet als de code toch verschijnt.
  const bouwjaar = Number(payload?.bouwjaar);
  const hasIsde = applicable.some((r) => r.code === "ISDE");
  const showBouwjaarWarning =
    Number.isFinite(bouwjaar) && bouwjaar >= 2019 && hasIsde;

  return (
    <div className="grid gap-5">
      {applicable.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
          <div className="text-lg font-bold text-gray-900">
            Geen standaardregelingen direct van toepassing
          </div>
          <p className="mt-2 text-sm text-gray-600">
            AAA-Lex denkt graag mee over alternatieve routes en
            gemeentelijke regelingen.
          </p>
        </div>
      ) : (
        applicable.map((r) => <RegelingCard key={r.code} regeling={r} />)
      )}

      {applicable.length > 0 && (
        <div className="rounded-xl bg-brand-green p-5 text-white">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
                Totaal geschatte subsidie
              </div>
              <div className="text-3xl font-extrabold">
                {formatEuro(data.totaal_geschatte_subsidie)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
                U ontvangt netto (na AAA-Lex fee)
              </div>
              <div className="text-2xl font-bold">
                {formatEuro(data.totaal_klant_ontvangt)}
              </div>
            </div>
          </div>
        </div>
      )}

      {(data.waarschuwingen?.length > 0 || showBouwjaarWarning) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="mb-2 font-semibold">Belangrijk om te weten</div>
          <ul className="list-disc space-y-1 pl-5">
            {showBouwjaarWarning && (
              <li>
                <strong>Bouwjaar na 2019:</strong> ISDE is in beginsel
                alleen beschikbaar voor woningen van vóór 2019. Wij
                controleren uw situatie en bespreken alternatieven indien
                nodig.
              </li>
            )}
            {data.waarschuwingen?.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-700">
        <span className="font-semibold">Volgende stap:</span>{" "}
        {data.volgende_stap}
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Link to="/register" className="btn-primary flex-1 text-center">
          Start mijn aanvraag
        </Link>
        <Link to="/contact" className="btn-secondary flex-1 text-center">
          Neem contact op met AAA-Lex
        </Link>
      </div>

      {notApplicable.length > 0 && (
        <details className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
          <summary className="cursor-pointer font-semibold text-gray-800">
            Regelingen die (nu) niet van toepassing zijn ({notApplicable.length})
          </summary>
          <ul className="mt-3 space-y-3">
            {notApplicable.map((r) => (
              <li key={r.code} className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-gray-300 px-2 py-0.5 text-xs font-bold uppercase text-gray-700">
                    {r.code}
                  </span>
                  <span className="font-semibold text-gray-800">{r.naam}</span>
                </div>
                <p className="mt-1 text-gray-600">{r.toelichting}</p>
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="pt-2 text-xs leading-relaxed text-gray-500">
        Dit is een indicatieve berekening. Aan deze berekening kunnen geen
        rechten worden ontleend. De definitieve subsidie wordt bepaald door
        RVO.
      </p>
    </div>
  );
}
