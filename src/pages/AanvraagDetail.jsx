import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DocumentChecklist from "../components/DocumentChecklist.jsx";
import StatusBadge, { RegelingBadge } from "../components/StatusBadge.jsx";
import { api, apiErrorMessage } from "../lib/api.js";
import {
  daysUntil,
  formatDate,
  formatEuro,
  maatregelLabel,
  regelingLabel,
  typeAanvragerLabel,
} from "../lib/formatters.js";

function DeadlineBanner({ datum }) {
  if (!datum) return null;
  const days = daysUntil(datum);
  if (days === null) return null;
  if (days < 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <strong>Deadline verlopen:</strong> de uiterste datum ({formatDate(datum)}) is{" "}
        {Math.abs(days)} dagen geleden verstreken. Neem direct contact op met
        AAA-Lex.
      </div>
    );
  }
  if (days <= 14) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Deadline nadert:</strong> nog {days} dagen tot{" "}
        {formatDate(datum)}. Upload zo snel mogelijk de ontbrekende documenten.
      </div>
    );
  }
  return null;
}

function StatusTimeline({ events }) {
  if (!events?.length) return null;
  return (
    <ol className="relative border-l-2 border-gray-200 pl-6">
      {events.map((e, i) => (
        <li key={`${e.status}-${i}`} className="mb-6 last:mb-0">
          <span
            className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${
              e.current
                ? e.status === "afgewezen"
                  ? "bg-red-500"
                  : "bg-brand-green"
                : e.reached
                  ? "bg-brand-green"
                  : "bg-gray-300"
            }`}
            aria-hidden
          />
          <div
            className={`text-sm font-semibold ${
              e.current
                ? e.status === "afgewezen"
                  ? "text-red-700"
                  : "text-brand-green"
                : e.reached
                  ? "text-gray-900"
                  : "text-gray-500"
            }`}
          >
            {e.label}
          </div>
          {e.current && e.at && (
            <div className="text-xs text-gray-500">
              sinds {formatDate(e.at)}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function NotesCard({ aanvraagId, initialValue, onSaved }) {
  const [value, setValue] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  async function save() {
    setError(null);
    setSaving(true);
    setSaved(false);
    try {
      const { data } = await api.patch(`/aanvragen/${aanvraagId}`, {
        notes: value,
      });
      setSaved(true);
      onSaved?.(data);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900">Notities</h3>
      <p className="mt-1 text-sm text-gray-500">
        Eigen notities bij deze aanvraag. Zichtbaar voor AAA-Lex.
      </p>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mt-3 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-brand-green focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
        placeholder="Bijzonderheden, planning, contactpersoon…"
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="text-sm">
          {error && <span className="text-red-700">{error}</span>}
          {saved && <span className="text-green-700">Opgeslagen</span>}
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-primary !px-4 !py-2 text-sm disabled:opacity-60"
        >
          {saving ? "Opslaan…" : "Notities opslaan"}
        </button>
      </div>
    </div>
  );
}

export default function AanvraagDetail() {
  const { id } = useParams();
  const [aanvraag, setAanvraag] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.get(`/aanvragen/${id}`),
      api.get(`/aanvragen/${id}/documenten`),
    ])
      .then(([a, c]) => {
        if (cancelled) return;
        setAanvraag(a.data);
        setChecklist(c.data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(apiErrorMessage(err));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container-app flex min-h-[60vh] items-center justify-center py-14">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-greenLight border-t-brand-green" />
      </div>
    );
  }
  if (error || !aanvraag) {
    return (
      <div className="container-app py-10">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error || "Aanvraag niet gevonden."}
        </div>
        <Link to="/dashboard" className="mt-4 inline-block text-sm font-semibold text-brand-green hover:underline">
          ← Terug naar dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-6 sm:py-10">
      <Link
        to="/dashboard"
        className="text-sm font-semibold text-brand-green hover:underline"
      >
        ← Terug naar dashboard
      </Link>

      <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <RegelingBadge code={aanvraag.regeling} />
            <StatusBadge status={aanvraag.status} />
          </div>
          {aanvraag.deadline_datum && (
            <div className="text-sm">
              <span className="text-gray-500">Deadline: </span>
              <span className="font-semibold text-gray-900">
                {formatDate(aanvraag.deadline_datum)}
              </span>
            </div>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">
          {regelingLabel(aanvraag.regeling)} — {maatregelLabel(aanvraag.maatregel)}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {typeAanvragerLabel(aanvraag.type_aanvrager)} · aangemaakt{" "}
          {formatDate(aanvraag.created_at)}
        </p>
      </div>

      <div className="mt-4">
        <DeadlineBanner datum={aanvraag.deadline_datum} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Status</h2>
            <div className="mt-4">
              <StatusTimeline events={aanvraag.status_timeline} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Documentenchecklist
            </h2>
            <div className="mt-4">
              <DocumentChecklist
                aanvraagId={aanvraag.id}
                checklist={checklist}
                onChanged={async () => {
                  const [a, c] = await Promise.all([
                    api.get(`/aanvragen/${aanvraag.id}`),
                    api.get(`/aanvragen/${aanvraag.id}/documenten`),
                  ]);
                  setAanvraag(a.data);
                  setChecklist(c.data);
                }}
              />
            </div>
          </div>

          <NotesCard
            aanvraagId={aanvraag.id}
            initialValue={aanvraag.notes}
            onSaved={(updated) => setAanvraag((a) => ({ ...a, notes: updated.notes }))}
          />
        </div>

        <aside className="grid gap-4">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Financieel</h2>
            <dl className="mt-3 grid gap-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Investering</dt>
                <dd className="font-semibold text-gray-900">
                  {formatEuro(aanvraag.investering_bedrag)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Geschatte subsidie</dt>
                <dd className="font-semibold text-brand-green">
                  {formatEuro(aanvraag.geschatte_subsidie)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">
                  AAA-Lex fee
                  {aanvraag.aaa_lex_fee_percentage
                    ? ` (${aanvraag.aaa_lex_fee_percentage}%)`
                    : ""}
                </dt>
                <dd className="text-gray-700">
                  {formatEuro(aanvraag.aaa_lex_fee_bedrag)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-gray-100 pt-3">
                <dt className="font-semibold text-gray-900">U ontvangt netto</dt>
                <dd className="font-extrabold text-gray-900">
                  {formatEuro(aanvraag.klant_ontvangt)}
                </dd>
              </div>
              {aanvraag.toegekende_subsidie && (
                <div className="flex justify-between gap-3 border-t border-gray-100 pt-3">
                  <dt className="text-gray-500">Toegekende subsidie</dt>
                  <dd className="font-bold text-green-700">
                    {formatEuro(aanvraag.toegekende_subsidie)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 text-sm text-gray-700 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Gegevens</h2>
            <dl className="mt-3 grid gap-2">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Regeling</dt>
                <dd className="font-semibold">
                  {regelingLabel(aanvraag.regeling)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Type aanvrager</dt>
                <dd className="font-semibold">
                  {typeAanvragerLabel(aanvraag.type_aanvrager)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Maatregel</dt>
                <dd className="font-semibold">
                  {maatregelLabel(aanvraag.maatregel)}
                </dd>
              </div>
              {aanvraag.rvo_aanvraagnummer && (
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500">RVO-nummer</dt>
                  <dd className="font-semibold">
                    {aanvraag.rvo_aanvraagnummer}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
