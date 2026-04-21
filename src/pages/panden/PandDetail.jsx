import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { RegelingBadge } from "../../components/StatusBadge.jsx";
import DeadlineBadge, {
  EnergielabelBadge,
} from "../../components/panden/DeadlineBadge.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import { getCurrentUser } from "../../lib/auth.js";
import { formatEuro } from "../../lib/formatters.js";
import {
  ENERGIELABELS,
  deletePand,
  eigenaarTypeLabel,
  getPand,
  maatregelLabel,
  maatregelStatusLabel,
  pandTypeLabel,
  updatePand,
} from "../../lib/panden.js";
import NieuweMaatregelModal from "./NieuweMaatregelModal.jsx";

export default function PandDetail() {
  const { id } = useParams();
  const [pand, setPand] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("maatregelen");
  const [newModal, setNewModal] = useState(false);

  const user = getCurrentUser();
  const isAdmin = user?.role === "admin";

  async function reload() {
    setLoading(true);
    try {
      const data = await getPand(id);
      setPand(data);
      setError(null);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="container-app flex min-h-[40vh] items-center justify-center py-10">
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
      </div>
    );
  }
  if (!pand) return null;

  async function handleDelete() {
    if (
      !confirm(
        "Weet u zeker dat u dit pand wilt verwijderen? Alle bijbehorende maatregelen en dossiers worden ook verwijderd.",
      )
    )
      return;
    try {
      await deletePand(pand.id);
      window.location.assign("/panden");
    } catch (e) {
      alert(apiErrorMessage(e, "Verwijderen mislukt"));
    }
  }

  return (
    <div className="container-app py-8 sm:py-10">
      <Link
        to="/panden"
        className="text-sm font-semibold text-brand-green hover:underline"
      >
        ← Terug naar panden
      </Link>

      <header className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            {pand.straat} {pand.huisnummer}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {pand.postcode} {pand.plaats}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <EnergielabelBadge label={pand.energielabel_huidig} />
            <span>
              <span className="text-gray-400">Bouwjaar:</span>{" "}
              <span className="font-semibold text-gray-800">
                {pand.bouwjaar}
              </span>
            </span>
            <span>
              <span className="text-gray-400">Type:</span>{" "}
              <span className="font-semibold text-gray-800">
                {pandTypeLabel(pand.pand_type)}
              </span>
            </span>
            <span>
              <span className="text-gray-400">Eigenaar:</span>{" "}
              <span className="font-semibold text-gray-800">
                {eigenaarTypeLabel(pand.eigenaar_type)}
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setNewModal(true)}
            className="btn-primary"
          >
            + Maatregel toevoegen
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm font-semibold text-red-700 hover:underline"
          >
            Verwijder pand
          </button>
        </div>
      </header>

      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6 text-sm font-semibold">
          {[
            ["maatregelen", "Maatregelen"],
            ["aaa-lex", "AAA-Lex informatie"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`border-b-2 pb-3 ${
                tab === value
                  ? "border-brand-green text-brand-green"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {tab === "maatregelen" ? (
        <MaatregelList pand={pand} onAdd={() => setNewModal(true)} />
      ) : (
        <AaaLexInfo pand={pand} isAdmin={isAdmin} onSaved={reload} />
      )}

      {newModal && (
        <NieuweMaatregelModal
          pand={pand}
          onClose={() => setNewModal(false)}
          onCreated={() => {
            setNewModal(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function MaatregelList({ pand, onAdd }) {
  if (!pand.maatregelen || pand.maatregelen.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <div className="text-4xl">🛠️</div>
        <h3 className="mt-3 text-lg font-semibold text-gray-900">
          Nog geen maatregelen
        </h3>
        <p className="mt-1 max-w-sm text-sm text-gray-600">
          Voeg een maatregel toe om uw subsidiekansen en deadlines te
          berekenen.
        </p>
        <button type="button" onClick={onAdd} className="btn-primary mt-5">
          + Eerste maatregel toevoegen
        </button>
      </div>
    );
  }
  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2">
      {pand.maatregelen.map((m) => (
        <li
          key={m.id}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-gray-900">
                {maatregelLabel(m.maatregel_type)}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
                  {maatregelStatusLabel(m.status)}
                </span>
                {m.regeling_code && <RegelingBadge code={m.regeling_code} />}
              </div>
            </div>
            <DeadlineBadge status={m.deadline_status} datum={m.deadline_indienen} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-y-1 text-xs text-gray-600">
            <dt className="text-gray-400">Geschatte subsidie</dt>
            <dd className="font-semibold text-gray-800">
              {formatEuro(m.geschatte_subsidie)}
            </dd>
          </dl>

          <div className="mt-4 flex items-center justify-end">
            <Link
              to={`/panden/${pand.id}/maatregelen/${m.id}`}
              className="text-sm font-semibold text-brand-green hover:underline"
            >
              Bekijk dossier →
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

function AaaLexInfo({ pand, isAdmin, onSaved }) {
  if (isAdmin) {
    return <AaaLexAdminEditor pand={pand} onSaved={onSaved} />;
  }
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <InfoCard title="Energie">
        <Row label="Huidig label">
          <EnergielabelBadge label={pand.energielabel_huidig} />
        </Row>
        <Row label="Label na maatregelen">
          <EnergielabelBadge label={pand.energielabel_na_maatregelen} />
        </Row>
        <Row label="Oppervlakte">
          <span className="font-semibold text-gray-800">
            {pand.oppervlakte_m2 ? `${pand.oppervlakte_m2} m²` : "—"}
          </span>
        </Row>
      </InfoCard>
      <InfoCard title="Notities van AAA-Lex">
        {pand.notities ? (
          <p className="whitespace-pre-line text-sm text-gray-700">
            {pand.notities}
          </p>
        ) : (
          <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 text-sm italic text-gray-500">
            AAA-Lex vult dit in na de opname.
          </p>
        )}
      </InfoCard>
    </div>
  );
}

function AaaLexAdminEditor({ pand, onSaved }) {
  const [form, setForm] = useState({
    energielabel_huidig: pand.energielabel_huidig || "",
    energielabel_na_maatregelen: pand.energielabel_na_maatregelen || "",
    oppervlakte_m2: pand.oppervlakte_m2 ?? "",
    notities: pand.notities || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  function set(f, v) {
    setForm((prev) => ({ ...prev, [f]: v }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMsg(null);
    try {
      await updatePand(pand.id, {
        energielabel_huidig: form.energielabel_huidig || null,
        energielabel_na_maatregelen: form.energielabel_na_maatregelen || null,
        oppervlakte_m2:
          form.oppervlakte_m2 === "" ? null : Number(form.oppervlakte_m2),
        notities: form.notities || null,
      });
      setMsg("Opgeslagen");
      onSaved?.();
    } catch (e) {
      setError(apiErrorMessage(e, "Opslaan mislukt"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-brand-greenLight px-2 py-0.5 text-xs font-extrabold uppercase tracking-wide text-brand-green">
          Admin
        </span>
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-gray-500">
          AAA-Lex gegevens bewerken
        </h3>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 inline-block font-semibold text-gray-800">
            Energielabel huidig
          </span>
          <select
            className="input"
            value={form.energielabel_huidig}
            onChange={(e) => set("energielabel_huidig", e.target.value)}
          >
            <option value="">— Onbekend —</option>
            {ENERGIELABELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 inline-block font-semibold text-gray-800">
            Energielabel na maatregelen
          </span>
          <select
            className="input"
            value={form.energielabel_na_maatregelen}
            onChange={(e) =>
              set("energielabel_na_maatregelen", e.target.value)
            }
          >
            <option value="">— Onbekend —</option>
            {ENERGIELABELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 inline-block font-semibold text-gray-800">
            Oppervlakte (m²)
          </span>
          <input
            type="number"
            step="0.1"
            min="0"
            className="input"
            value={form.oppervlakte_m2}
            onChange={(e) => set("oppervlakte_m2", e.target.value)}
          />
        </label>
      </div>

      <label className="mt-4 block text-sm">
        <span className="mb-1 inline-block font-semibold text-gray-800">
          Notities
        </span>
        <textarea
          rows={4}
          className="input"
          value={form.notities}
          onChange={(e) => set("notities", e.target.value)}
          placeholder="Opname-notities, bijzonderheden, afspraken…"
        />
      </label>

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {msg && (
        <div className="mt-3 rounded-md border border-brand-green/30 bg-brand-greenLight p-3 text-sm text-brand-greenDark">
          {msg}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={save}
          className="btn-primary"
          disabled={saving}
        >
          {saving ? "Opslaan…" : "Opslaan"}
        </button>
      </div>
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-gray-500">
        {title}
      </h3>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}
function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span>{children}</span>
    </div>
  );
}
