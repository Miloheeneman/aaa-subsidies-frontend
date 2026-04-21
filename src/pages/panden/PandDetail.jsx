import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import {
  DeadlineBadge,
  EnergielabelBadge,
  MaatregelStatusBadge,
  RegelingPandBadge,
} from "../../components/panden/PandBadges.jsx";
import NieuweMaatregelModal from "../../components/panden/NieuweMaatregelModal.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import {
  eigenaarTypeLabel,
  formatDate,
  formatEuro,
  maatregelTypeLabel,
  pandTypeLabel,
} from "../../lib/formatters.js";
import {
  deletePand,
  getPand,
} from "../../lib/pandenApi.js";

export default function PandDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pand, setPand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("maatregelen");
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getPand(id);
      setPand(data);
      setError(null);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDelete() {
    if (
      !window.confirm(
        "Weet u zeker dat u dit pand wilt verwijderen? Dit maakt het dossier ontoegankelijk.",
      )
    )
      return;
    try {
      await deletePand(id);
      navigate("/panden", { replace: true });
    } catch (err) {
      alert(apiErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="container-app flex min-h-[50vh] items-center justify-center py-14">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-greenLight border-t-brand-green" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-app py-10">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
        <Link to="/panden" className="mt-4 inline-block text-sm text-brand-green">
          ← Terug naar mijn panden
        </Link>
      </div>
    );
  }

  if (!pand) return null;

  const maatregelen = pand.maatregelen ?? [];

  return (
    <div className="container-app py-8 sm:py-10">
      <Link
        to="/panden"
        className="text-sm font-semibold text-brand-green hover:underline"
      >
        ← Alle panden
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {pand.straat} {pand.huisnummer}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {pand.postcode} {pand.plaats}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <EnergielabelBadge label={pand.energielabel_huidig} size="lg" />
            <span className="text-sm text-gray-500">
              {pandTypeLabel(pand.pand_type)} · Bouwjaar {pand.bouwjaar} ·{" "}
              {eigenaarTypeLabel(pand.eigenaar_type)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:border-red-200 hover:bg-red-50"
          >
            Verwijder pand
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary !py-2 !px-4 text-sm"
          >
            + Maatregel toevoegen
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2 border-b border-gray-200">
        <TabButton active={tab === "maatregelen"} onClick={() => setTab("maatregelen")}>
          Maatregelen ({maatregelen.length})
        </TabButton>
        <TabButton active={tab === "aaa-lex"} onClick={() => setTab("aaa-lex")}>
          AAA-Lex informatie
        </TabButton>
      </div>

      {tab === "maatregelen" && (
        <div className="mt-6">
          {maatregelen.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
              <div className="text-4xl" aria-hidden>
                🧰
              </div>
              <h3 className="mt-3 text-lg font-bold text-gray-900">
                Nog geen maatregelen
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">
                Voeg een maatregel toe om uw subsidiekansen te berekenen.
                Elke maatregel koppelt aan een regeling (ISDE, EIA, MIA of
                DUMAVA) met bijbehorende deadlines.
              </p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="btn-primary mt-4"
              >
                + Eerste maatregel toevoegen
              </button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {maatregelen.map((m) => (
                <MaatregelCard key={m.id} pand={pand} m={m} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "aaa-lex" && (
        <div className="mt-6 space-y-4 rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="text-base font-bold text-gray-900">AAA-Lex opname</h3>
          <p className="text-sm text-gray-600">
            Onderstaande gegevens worden door AAA-Lex ingevuld na een opname.
            Zie dit als de 'fiche' van uw pand die wij gebruiken bij
            subsidieaanvragen.
          </p>
          <dl className="grid gap-4 sm:grid-cols-2">
            <InfoRow
              label="Huidig energielabel"
              value={
                pand.energielabel_huidig ? (
                  <EnergielabelBadge label={pand.energielabel_huidig} />
                ) : null
              }
              placeholder="AAA-Lex vult dit in na de opname"
            />
            <InfoRow
              label="Label na maatregelen"
              value={
                pand.energielabel_na_maatregelen ? (
                  <EnergielabelBadge
                    label={pand.energielabel_na_maatregelen}
                  />
                ) : null
              }
              placeholder="Wordt ingevuld bij opname"
            />
            <InfoRow
              label="Oppervlakte"
              value={pand.oppervlakte_m2 ? `${pand.oppervlakte_m2} m²` : null}
              placeholder="AAA-Lex meet dit bij de opname"
            />
            <InfoRow
              label="Notities"
              value={pand.notities}
              placeholder="Nog geen notities."
            />
          </dl>
        </div>
      )}

      {showModal && (
        <NieuweMaatregelModal
          pand={pand}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-brand-green text-brand-green"
          : "border-transparent text-gray-500 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

function InfoRow({ label, value, placeholder }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-gray-800">
        {value ?? (
          <span className="italic text-gray-400">{placeholder}</span>
        )}
      </dd>
    </div>
  );
}

function MaatregelCard({ pand, m }) {
  const docsTotal = m.documents_required || 0;
  const docsUploaded = m.documents_uploaded || 0;
  const progressPct =
    docsTotal > 0 ? Math.min(100, Math.round((docsUploaded / docsTotal) * 100)) : 0;
  return (
    <article className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            {maatregelTypeLabel(m.maatregel_type)}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <MaatregelStatusBadge status={m.status} />
            <RegelingPandBadge code={m.regeling_code} />
          </div>
        </div>
        <DeadlineBadge status={m.deadline_status} datum={m.deadline_indienen} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-600">
        <div>
          <dt className="font-semibold uppercase tracking-wide text-gray-400">
            Geschat
          </dt>
          <dd className="text-sm font-semibold text-gray-900">
            {formatEuro(m.geschatte_subsidie)}
          </dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-wide text-gray-400">
            Deadline
          </dt>
          <dd className="text-sm text-gray-800">
            {m.deadline_indienen ? formatDate(m.deadline_indienen) : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Documenten</span>
          <span>
            {docsUploaded}/{docsTotal} geüpload
          </span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-brand-green transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <Link
          to={`/panden/${pand.id}/maatregelen/${m.id}`}
          className="text-sm font-semibold text-brand-green hover:underline"
        >
          Bekijk dossier →
        </Link>
      </div>
    </article>
  );
}
