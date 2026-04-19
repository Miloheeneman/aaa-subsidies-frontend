import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DocumentChecklist from "../../components/DocumentChecklist.jsx";
import StatusBadge, {
  RegelingBadge,
} from "../../components/StatusBadge.jsx";
import api, { apiErrorMessage } from "../../lib/api.js";
import {
  daysUntil,
  formatDate,
  formatEuro,
  maatregelLabel,
  regelingLabel,
  typeAanvragerLabel,
} from "../../lib/formatters.js";

const STATUS_OPTIONS = [
  { value: "intake", label: "Intake" },
  { value: "documenten", label: "Documenten" },
  { value: "review", label: "Review" },
  { value: "ingediend", label: "Ingediend bij RVO" },
  { value: "goedgekeurd", label: "Goedgekeurd" },
  { value: "afgewezen", label: "Afgewezen" },
];

function StatusUpdatePanel({ aanvraagId, current, onUpdated }) {
  const [status, setStatus] = useState(current);
  const [toegekend, setToegekend] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(false);

  async function submit() {
    setError(null);
    setOk(false);
    if (status === current && !toegekend && !notes.trim()) {
      setError("Geen wijzigingen om op te slaan.");
      return;
    }
    if (status === "goedgekeurd" && !toegekend) {
      setError("Toegekend bedrag is verplicht bij goedkeuring.");
      return;
    }
    if (status === "afgewezen" && !notes.trim()) {
      setError("Reden (notities) is verplicht bij afwijzing.");
      return;
    }
    setBusy(true);
    try {
      const payload = { status };
      if (notes.trim()) payload.notes = notes.trim();
      if (status === "goedgekeurd" && toegekend) {
        payload.toegekende_subsidie = Number(toegekend);
      }
      await api.patch(`/admin/aanvragen/${aanvraagId}/status`, payload);
      setOk(true);
      setNotes("");
      setToegekend("");
      await onUpdated?.();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Status bijwerken</h2>
      <p className="mt-1 text-xs text-gray-500">
        Wijzig de status. Bij goedkeuring/afwijzing wordt automatisch een
        e-mail naar de klant gestuurd.
      </p>
      <div className="mt-4 grid gap-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {status === "goedgekeurd" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Toegekend bedrag (€) — verplicht
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={toegekend}
              onChange={(e) => setToegekend(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="bv. 2500"
            />
            <p className="mt-1 text-xs text-gray-500">
              AAA-Lex fee wordt automatisch herberekend.
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Notities {status === "afgewezen" && "(reden — verplicht)"}
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder={
              status === "afgewezen"
                ? "Reden van afwijzing (wordt naar klant gemaild)"
                : "Optionele notitie bij deze statuswijziging"
            }
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {error}
          </div>
        )}
        {ok && (
          <div className="rounded-md border border-green-200 bg-green-50 p-2 text-xs text-green-700">
            Status bijgewerkt. E-mailmelding verstuurd indien van toepassing.
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="btn-primary !py-2 !px-4 text-sm disabled:opacity-60"
        >
          {busy ? "Opslaan…" : "Status opslaan"}
        </button>
      </div>
    </div>
  );
}

function ClientInfo({ aanvraag }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Klantgegevens</h2>
      <dl className="mt-3 grid gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500">Organisatie</dt>
          <dd className="font-semibold text-gray-900">
            {aanvraag.organisation_name ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500">Contactpersoon</dt>
          <dd className="font-semibold">
            {aanvraag.aanvrager_name ?? "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500">E-mail</dt>
          <dd className="text-gray-700">
            <a
              href={`mailto:${aanvraag.aanvrager_email}`}
              className="hover:underline"
            >
              {aanvraag.aanvrager_email ?? "—"}
            </a>
          </dd>
        </div>
        {aanvraag.aanvrager_phone && (
          <div className="flex justify-between gap-3">
            <dt className="text-gray-500">Telefoon</dt>
            <dd className="text-gray-700">
              <a
                href={`tel:${aanvraag.aanvrager_phone}`}
                className="hover:underline"
              >
                {aanvraag.aanvrager_phone}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function AaaLexProjectCard({ project }) {
  if (!project) return null;
  return (
    <div className="rounded-xl border border-brand-greenLight bg-brand-greenLight/40 p-5">
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-green">
        AAA-Lex meting
      </div>
      <h2 className="mt-1 text-lg font-bold text-gray-900">
        {project.pandadres}
      </h2>
      <div className="mt-1 text-sm text-gray-700">
        {project.postcode} {project.plaats}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {project.bouwjaar && (
          <div>
            <dt className="text-xs text-gray-500">Bouwjaar</dt>
            <dd className="font-semibold">{project.bouwjaar}</dd>
          </div>
        )}
        {project.huidig_energielabel && (
          <div>
            <dt className="text-xs text-gray-500">Huidig label</dt>
            <dd className="font-semibold">{project.huidig_energielabel}</dd>
          </div>
        )}
        {project.nieuw_energielabel && (
          <div>
            <dt className="text-xs text-gray-500">Verwacht label</dt>
            <dd className="font-semibold text-brand-green">
              {project.nieuw_energielabel}
            </dd>
          </div>
        )}
        {project.geschatte_investering && (
          <div>
            <dt className="text-xs text-gray-500">Investering</dt>
            <dd className="font-semibold">
              {formatEuro(project.geschatte_investering)}
            </dd>
          </div>
        )}
      </dl>
      {Array.isArray(project.aanbevolen_maatregelen) &&
        project.aanbevolen_maatregelen.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Aanbevolen maatregelen
            </div>
            <ul className="mt-2 grid gap-1 text-sm text-gray-800">
              {project.aanbevolen_maatregelen.map((m, idx) => (
                <li key={idx} className="flex justify-between gap-2">
                  <span>{m.naam ?? m.label ?? JSON.stringify(m)}</span>
                  {m.kosten && (
                    <span className="text-gray-600">
                      {formatEuro(m.kosten)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
}

export default function AdminAanvraagDetail() {
  const { id } = useParams();
  const [aanvraag, setAanvraag] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [a, c] = await Promise.all([
        api.get(`/aanvragen/${id}`),
        api.get(`/aanvragen/${id}/documenten`),
      ]);
      setAanvraag(a.data);
      setChecklist(c.data);
      // optional AAA-Lex project lookup
      if (a.data.aaa_lex_project_id) {
        try {
          const p = await api.get(
            `/aaa-lex/project/${a.data.aaa_lex_project_id}`,
          );
          setProject(p.data);
        } catch {
          setProject(null);
        }
      }
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
        <Link
          to="/admin/aanvragen"
          className="mt-4 inline-block text-sm font-semibold text-brand-green hover:underline"
        >
          ← Terug naar aanvragenbeheer
        </Link>
      </div>
    );
  }

  const dl = daysUntil(aanvraag.deadline_datum);

  return (
    <div className="container-app py-6 sm:py-10">
      <Link
        to="/admin/aanvragen"
        className="text-sm font-semibold text-brand-green hover:underline"
      >
        ← Terug naar aanvragen
      </Link>

      <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <RegelingBadge code={aanvraag.regeling} />
            <StatusBadge status={aanvraag.status} />
            <span className="rounded-full bg-brand-greenLight px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
              Admin
            </span>
          </div>
          {aanvraag.deadline_datum && (
            <div className="text-sm">
              <span className="text-gray-500">Deadline: </span>
              <span className="font-semibold text-gray-900">
                {formatDate(aanvraag.deadline_datum)}
              </span>
              {dl !== null && (
                <span
                  className={`ml-2 text-xs ${
                    dl < 0
                      ? "text-red-600"
                      : dl <= 14
                        ? "text-amber-600"
                        : "text-gray-500"
                  }`}
                >
                  {dl < 0
                    ? `(${Math.abs(dl)} dgn verlopen)`
                    : `(nog ${dl} dgn)`}
                </span>
              )}
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

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="grid gap-4 lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Documentenchecklist
            </h2>
            <div className="mt-4">
              <DocumentChecklist
                aanvraagId={aanvraag.id}
                checklist={checklist}
                allowVerify
                onChanged={load}
              />
            </div>
          </div>

          {aanvraag.notes && (
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Notitie­geschiedenis
              </h2>
              <pre className="mt-3 whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-xs text-gray-800">
                {aanvraag.notes}
              </pre>
            </div>
          )}

          <AaaLexProjectCard project={project} />
        </div>

        <aside className="grid gap-4">
          <StatusUpdatePanel
            aanvraagId={aanvraag.id}
            current={aanvraag.status}
            onUpdated={load}
          />

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
              {aanvraag.toegekende_subsidie && (
                <div className="flex justify-between gap-3 border-t border-gray-100 pt-3">
                  <dt className="text-gray-500">Toegekende subsidie</dt>
                  <dd className="font-bold text-green-700">
                    {formatEuro(aanvraag.toegekende_subsidie)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-3 border-t border-gray-100 pt-3">
                <dt className="font-semibold text-gray-900">
                  Klant ontvangt netto
                </dt>
                <dd className="font-extrabold text-gray-900">
                  {formatEuro(aanvraag.klant_ontvangt)}
                </dd>
              </div>
            </dl>
          </div>

          <ClientInfo aanvraag={aanvraag} />
        </aside>
      </div>
    </div>
  );
}
