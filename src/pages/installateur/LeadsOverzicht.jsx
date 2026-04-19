import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { RegelingBadge } from "../../components/StatusBadge.jsx";
import api, { apiErrorMessage } from "../../lib/api.js";
import {
  formatDate,
  formatEuro,
  typeAanvragerLabel,
} from "../../lib/formatters.js";

const TABS = [
  { id: "alle", label: "Alle", filter: null },
  { id: "nieuw", label: "Nieuw", filter: "nieuw" },
  {
    id: "behandeling",
    label: "In behandeling",
    filter: "contact_opgenomen",
  },
  { id: "gewonnen", label: "Gewonnen", filter: "gewonnen" },
  { id: "verloren", label: "Verloren", filter: "verloren" },
];

const STATUS_LABEL = {
  nieuw: "Nieuw",
  contact_opgenomen: "Contact opgenomen",
  gewonnen: "Gewonnen",
  verloren: "Verloren",
};

const STATUS_PILL = {
  nieuw: "bg-blue-50 text-blue-800 ring-blue-200",
  contact_opgenomen: "bg-amber-50 text-amber-800 ring-amber-200",
  gewonnen: "bg-green-50 text-green-800 ring-green-200",
  verloren: "bg-red-50 text-red-800 ring-red-200",
};

function LeadCard({ lead, onUpdate, busy }) {
  const a = lead.aanvraag;
  const unlocked = lead.client !== null && lead.client !== undefined;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <RegelingBadge code={a.regeling} />
            <span className="text-sm text-gray-700">
              {typeAanvragerLabel(a.type_aanvrager)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Aangemaakt {formatDate(lead.created_at)}
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
            STATUS_PILL[lead.status] ||
            "bg-gray-100 text-gray-700 ring-gray-200"
          }`}
        >
          {STATUS_LABEL[lead.status] || lead.status}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Locatie
          </div>
          <div className="text-gray-800">
            {a.postcode || "—"} {a.plaats && `· ${a.plaats}`}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Geschatte investering
          </div>
          <div className="text-gray-800">
            {formatEuro(a.investering_bedrag)}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Geschatte subsidie
          </div>
          <div className="text-gray-800">
            {formatEuro(a.geschatte_subsidie)}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Voornaam klant
          </div>
          <div className="text-gray-800">
            {lead.client_preview?.first_name || "—"}
            {!unlocked && (
              <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-500">
                Vergrendeld
              </span>
            )}
          </div>
        </div>
      </div>

      {unlocked && (
        <div className="mt-4 rounded-lg border border-brand-green/30 bg-brand-greenLight/40 p-4 text-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-green">
            Contactgegevens
          </div>
          <div className="mt-1 grid gap-1 text-gray-800 sm:grid-cols-2">
            <div>
              <strong>
                {[lead.client.first_name, lead.client.last_name]
                  .filter(Boolean)
                  .join(" ")}
              </strong>
              {lead.client.organisation_name && (
                <div className="text-gray-600">
                  {lead.client.organisation_name}
                </div>
              )}
            </div>
            <div>
              <a
                className="text-brand-green hover:underline"
                href={`mailto:${lead.client.email}`}
              >
                {lead.client.email}
              </a>
              {lead.client.phone && (
                <div className="text-gray-600">{lead.client.phone}</div>
              )}
              {lead.client.full_address && (
                <div className="text-gray-600">
                  {lead.client.full_address}
                </div>
              )}
            </div>
          </div>
          <div className="mt-3">
            <Link
              to={`/installateur/dossier/${a.id}`}
              className="text-sm font-semibold text-brand-green hover:underline"
            >
              Bekijk dossier →
            </Link>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {lead.status === "nieuw" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdate(lead.id, "contact_opgenomen")}
            className="btn-primary !py-2 !px-4 text-sm"
          >
            Neem contact op
          </button>
        )}
        {lead.status !== "gewonnen" && lead.status !== "verloren" && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onUpdate(lead.id, "gewonnen")}
              className="btn-secondary !py-2 !px-4 text-sm"
            >
              Markeer als gewonnen
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onUpdate(lead.id, "verloren")}
              className="btn-secondary !py-2 !px-4 text-sm"
            >
              Markeer als verloren
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function LeadsOverzicht() {
  const [leads, setLeads] = useState([]);
  const [tab, setTab] = useState("alle");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/installateur/leads");
      setLeads(res.data ?? []);
      setLocked(false);
    } catch (err) {
      if (err?.response?.status === 402) {
        setLocked(true);
        setLeads([]);
      } else {
        setError(apiErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(leadId, newStatus) {
    setBusy(true);
    try {
      const res = await api.patch(`/installateur/leads/${leadId}`, {
        status: newStatus,
      });
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? res.data : l)),
      );
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const filtered = useMemo(() => {
    const filter = TABS.find((t) => t.id === tab)?.filter;
    if (!filter) return leads;
    return leads.filter((l) => l.status === filter);
  }, [leads, tab]);

  return (
    <div className="container-app py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Leads</h1>
        <p className="text-sm text-gray-600">
          Klanten in uw regio die op zoek zijn naar een installateur.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {locked && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="text-lg font-bold text-amber-900">
            Activeer uw abonnement
          </h2>
          <p className="mt-1 text-sm text-amber-900">
            Leads zijn alleen zichtbaar voor installateurs met een actief
            abonnement.
          </p>
          <Link
            to="/installateur/abonnement"
            className="btn-primary mt-4 inline-flex !py-2 !px-4 text-sm"
          >
            Bekijk abonnementen
          </Link>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-white p-5 opacity-50 blur-[2px]"
              >
                <div className="h-6 w-24 rounded bg-gray-200" />
                <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!locked && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {TABS.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    active
                      ? "bg-brand-green text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
              Laden…
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
              Geen leads in deze categorie.
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  busy={busy}
                  onUpdate={updateStatus}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
