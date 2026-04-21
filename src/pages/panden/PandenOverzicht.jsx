import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../../components/EmptyState.jsx";
import DeadlineBadge, {
  EnergielabelBadge,
} from "../../components/panden/DeadlineBadge.jsx";
import UpgradeModal from "../../components/panden/UpgradeModal.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import {
  eigenaarTypeLabel,
  listPanden,
  pandTypeLabel,
} from "../../lib/panden.js";

export default function PandenOverzicht() {
  const [state, setState] = useState({ loading: true });
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listPanden()
      .then((data) => !cancelled && setState({ loading: false, data }))
      .catch(
        (e) =>
          !cancelled && setState({ loading: false, error: apiErrorMessage(e) }),
      );
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="container-app flex min-h-[40vh] items-center justify-center py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-greenLight border-t-brand-green" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="container-app py-10">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {state.error}
        </div>
      </div>
    );
  }

  const { items = [], quota } = state.data;
  const canAdd = quota?.limit === null || !quota?.exceeded;

  function handleNewPand(e) {
    if (!canAdd) {
      e.preventDefault();
      setShowUpgrade(true);
    }
  }

  return (
    <div className="container-app py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Mijn panden
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Overzicht van al uw vastgoedobjecten en de bijbehorende
            subsidie-maatregelen.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quota && (
            <span className="hidden text-xs text-gray-500 sm:inline">
              Panden gebruikt: {quota.used}
              {quota.limit !== null && ` / ${quota.limit}`}
            </span>
          )}
          <Link
            to="/panden/nieuw"
            onClick={handleNewPand}
            className="btn-primary"
          >
            + Nieuw pand
          </Link>
        </div>
      </div>

      {quota?.exceeded && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          U heeft het maximum aantal panden van uw {quota.plan}-plan bereikt
          ({quota.limit}).{" "}
          <Link
            to="/onboarding/plan"
            className="font-semibold underline hover:no-underline"
          >
            Upgrade om meer panden toe te voegen
          </Link>
          .
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="U heeft nog geen panden"
            description="Voeg uw eerste pand toe om subsidiekansen te ontdekken."
            action={
              <Link to="/panden/nieuw" className="btn-primary">
                Voeg pand toe
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Link
              key={p.id}
              to={`/panden/${p.id}`}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-brand-green/40 hover:shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-gray-900 group-hover:text-brand-green">
                    {p.straat} {p.huisnummer}
                  </h3>
                  <p className="truncate text-xs text-gray-500">
                    {p.postcode} {p.plaats}
                  </p>
                </div>
                <EnergielabelBadge label={p.energielabel_huidig} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-y-1 text-xs text-gray-600">
                <dt className="text-gray-400">Type</dt>
                <dd className="font-medium text-gray-700">
                  {pandTypeLabel(p.pand_type)}
                </dd>
                <dt className="text-gray-400">Eigenaar</dt>
                <dd className="font-medium text-gray-700">
                  {eigenaarTypeLabel(p.eigenaar_type)}
                </dd>
                <dt className="text-gray-400">Bouwjaar</dt>
                <dd className="font-medium text-gray-700">{p.bouwjaar}</dd>
                <dt className="text-gray-400">Maatregelen</dt>
                <dd className="font-medium text-gray-700">
                  {p.aantal_maatregelen}
                </dd>
              </dl>

              <div className="mt-4 flex items-center justify-between text-xs">
                <DeadlineBadge status={p.worst_deadline_status} />
                <span className="font-semibold text-brand-green opacity-0 transition group-hover:opacity-100">
                  Bekijk →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        quota={quota}
      />
    </div>
  );
}
