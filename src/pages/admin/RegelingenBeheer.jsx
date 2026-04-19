import { useEffect, useState } from "react";

import EmptyState from "../../components/EmptyState.jsx";
import LoadingSpinner, {
  FullPageSpinner,
} from "../../components/LoadingSpinner.jsx";
import { RegelingBadge } from "../../components/StatusBadge.jsx";
import api, { apiErrorMessage } from "../../lib/api.js";
import { formatEuro } from "../../lib/formatters.js";

const FIELD_KEYS = [
  "naam",
  "beschrijving",
  "fee_percentage",
  "min_investering",
  "max_subsidie",
  "aanvraag_termijn_dagen",
];

function toFormState(reg) {
  return {
    naam: reg.naam ?? "",
    beschrijving: reg.beschrijving ?? "",
    fee_percentage: reg.fee_percentage?.toString() ?? "",
    min_investering: reg.min_investering?.toString() ?? "",
    max_subsidie: reg.max_subsidie?.toString() ?? "",
    aanvraag_termijn_dagen: reg.aanvraag_termijn_dagen?.toString() ?? "",
    actief: !!reg.actief,
  };
}

function isDirty(reg, draft) {
  if (draft.actief !== !!reg.actief) return true;
  for (const key of FIELD_KEYS) {
    const current =
      key === "naam" || key === "beschrijving"
        ? reg[key] ?? ""
        : reg[key] != null
          ? reg[key].toString()
          : "";
    if ((draft[key] ?? "") !== current) return true;
  }
  return false;
}

function buildPayload(reg, draft) {
  const payload = {};
  if (draft.actief !== !!reg.actief) payload.actief = draft.actief;
  if ((draft.naam ?? "") !== (reg.naam ?? "")) payload.naam = draft.naam;
  if ((draft.beschrijving ?? "") !== (reg.beschrijving ?? ""))
    payload.beschrijving = draft.beschrijving;

  for (const key of [
    "fee_percentage",
    "min_investering",
    "max_subsidie",
    "aanvraag_termijn_dagen",
  ]) {
    const current = reg[key] != null ? reg[key].toString() : "";
    if ((draft[key] ?? "") === current) continue;
    if (draft[key] === "" || draft[key] == null) continue;
    const parsed =
      key === "aanvraag_termijn_dagen"
        ? parseInt(draft[key], 10)
        : parseFloat(draft[key]);
    if (Number.isNaN(parsed)) continue;
    payload[key] = parsed;
  }
  return payload;
}

function RegelingCard({ reg, onSaved }) {
  const [draft, setDraft] = useState(() => toFormState(reg));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  function update(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function persist(payload) {
    setSaving(true);
    setError(null);
    try {
      const resp = await api.patch(
        `/admin/regelingen/${reg.code}`,
        payload,
      );
      onSaved(resp.data);
      setConfirmDeactivate(false);
    } catch (err) {
      setError(apiErrorMessage(err, "Kon regeling niet bijwerken."));
    } finally {
      setSaving(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!isDirty(reg, draft)) return;
    if (reg.actief && draft.actief === false && !confirmDeactivate) {
      setConfirmDeactivate(true);
      return;
    }
    persist(buildPayload(reg, draft));
  }

  function reset() {
    setDraft(toFormState(reg));
    setError(null);
    setConfirmDeactivate(false);
  }

  const dirty = isDirty(reg, draft);

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <RegelingBadge code={reg.code} />
          <div>
            <input
              type="text"
              value={draft.naam}
              onChange={(e) => update("naam", e.target.value)}
              className="w-full rounded-md border border-transparent bg-transparent px-1 text-lg font-bold text-gray-900 focus:border-gray-300 focus:bg-white focus:outline-none"
            />
            <div className="mt-0.5 text-xs text-gray-500">
              Code: <span className="font-mono">{reg.code}</span>
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={draft.actief}
            onChange={(e) => {
              update("actief", e.target.checked);
              if (e.target.checked) setConfirmDeactivate(false);
            }}
            className="h-4 w-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
          />
          <span
            className={
              draft.actief ? "text-brand-green" : "text-gray-500"
            }
          >
            {draft.actief ? "Actief" : "Inactief"}
          </span>
        </label>
      </div>

      <textarea
        value={draft.beschrijving}
        onChange={(e) => update("beschrijving", e.target.value)}
        rows={2}
        placeholder="Beschrijving..."
        className="mt-3 w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Fee % (succesfee)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={draft.fee_percentage}
            onChange={(e) => update("fee_percentage", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Min investering (€)
          </label>
          <input
            type="number"
            min="0"
            step="100"
            value={draft.min_investering}
            onChange={(e) => update("min_investering", e.target.value)}
            placeholder="—"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Max subsidie (€)
          </label>
          <input
            type="number"
            min="0"
            step="100"
            value={draft.max_subsidie}
            onChange={(e) => update("max_subsidie", e.target.value)}
            placeholder="—"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Aanvraagtermijn (dagen)
          </label>
          <input
            type="number"
            min="1"
            max="3650"
            step="1"
            value={draft.aanvraag_termijn_dagen}
            onChange={(e) =>
              update("aanvraag_termijn_dagen", e.target.value)
            }
            placeholder="—"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Huidige fee: <strong>{reg.fee_percentage}%</strong>
        {reg.min_investering != null && (
          <>
            {" · "}min: {formatEuro(reg.min_investering)}
          </>
        )}
        {reg.max_subsidie != null && (
          <>
            {" · "}max: {formatEuro(reg.max_subsidie)}
          </>
        )}
      </div>

      {confirmDeactivate && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="font-semibold">
            Weet u zeker dat u {reg.code} wilt deactiveren?
          </div>
          <div className="mt-1">
            Bestaande aanvragen worden niet beïnvloed, maar nieuwe
            aanvragen voor {reg.code} zijn niet meer mogelijk en de
            regeling verschijnt niet meer in de subsidiecheck.
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        {dirty && !saving && (
          <button
            type="button"
            onClick={reset}
            className="text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            Annuleren
          </button>
        )}
        <button
          type="submit"
          disabled={!dirty || saving}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" /> Opslaan...
            </span>
          ) : confirmDeactivate ? (
            "Bevestig deactiveren"
          ) : (
            "Opslaan"
          )}
        </button>
      </div>
    </form>
  );
}

export default function RegelingenBeheer() {
  const [regelingen, setRegelingen] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    try {
      const resp = await api.get("/admin/regelingen");
      setRegelingen(resp.data);
    } catch (err) {
      setError(apiErrorMessage(err, "Kon regelingen niet laden."));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function applyUpdate(updated) {
    setRegelingen((prev) =>
      (prev ?? []).map((r) => (r.code === updated.code ? updated : r)),
    );
  }

  if (error) {
    return (
      <div className="container-app py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (regelingen === null) {
    return <FullPageSpinner label="Regelingen laden..." />;
  }

  return (
    <div className="container-app py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Regelingenbeheer
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Activeer, deactiveer of pas configuratie aan per regeling.
            Deactiveren verbergt de regeling in de publieke subsidiecheck
            én blokkeert nieuwe aanvragen voor die code.
          </p>
        </div>
      </div>

      {regelingen.length === 0 ? (
        <EmptyState
          title="Geen regelingen geconfigureerd"
          description="Voeg regelingen toe via de seed-migratie of database."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {regelingen.map((reg) => (
            <RegelingCard key={reg.id} reg={reg} onSaved={applyUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
