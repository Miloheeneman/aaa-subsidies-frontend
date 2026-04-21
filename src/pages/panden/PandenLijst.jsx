import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import UpgradeModal from "../../components/panden/UpgradeModal.jsx";
import {
  DeadlineBadge,
  EnergielabelBadge,
} from "../../components/panden/PandBadges.jsx";
import { apiErrorMessage } from "../../lib/api.js";
import {
  formatDate,
  formatAdres,
  pandTypeLabel,
  eigenaarTypeLabel,
} from "../../lib/formatters.js";
import { listPanden } from "../../lib/pandenApi.js";

export default function PandenLijst() {
  const [panden, setPanden] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgradeInfo, setUpgradeInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listPanden()
      .then((data) => {
        if (cancelled) return;
        setPanden(data);
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
  }, []);

  if (loading) {
    return (
      <div className="container-app flex min-h-[50vh] items-center justify-center py-14">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-greenLight border-t-brand-green" />
      </div>
    );
  }

  return (
    <div className="container-app py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-brand-green">
            Mijn vastgoed
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">
            Mijn Panden
          </h1>
          <p className="mt-1 max-w-xl text-sm text-gray-600">
            Beheer uw vastgoed en voeg maatregelen toe om subsidiekansen te
            ontdekken. AAA-Lex bewaakt vervolgens de deadlines voor u.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard" className="btn-secondary !py-2 !px-4 text-sm">
            ← Dashboard
          </Link>
          <Link to="/panden/nieuw" className="btn-primary !py-2 !px-4 text-sm">
            Nieuw pand toevoegen
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {panden.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <div className="text-5xl" aria-hidden>
            🏠
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            U heeft nog geen panden
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
            Voeg uw eerste pand toe om subsidiekansen te ontdekken. Per pand
            kunt u meerdere maatregelen vastleggen en documenten uploaden.
          </p>
          <Link
            to="/panden/nieuw"
            className="btn-primary mt-5 inline-flex"
          >
            Voeg eerste pand toe
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {panden.map((p) => (
            <PandCard key={p.id} pand={p} />
          ))}
        </div>
      )}

      <UpgradeModal
        info={upgradeInfo}
        onClose={() => setUpgradeInfo(null)}
      />
    </div>
  );
}

function PandCard({ pand }) {
  return (
    <article className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-brand-green/40 hover:shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            {pand.straat} {pand.huisnummer}
          </h3>
          <div className="text-sm text-gray-600">
            {pand.postcode} {pand.plaats}
          </div>
        </div>
        <EnergielabelBadge label={pand.energielabel_huidig} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div>
          <dt className="font-semibold uppercase tracking-wide text-gray-400">
            Type
          </dt>
          <dd>{pandTypeLabel(pand.pand_type)}</dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-wide text-gray-400">
            Bouwjaar
          </dt>
          <dd>{pand.bouwjaar}</dd>
        </div>
        <div className="col-span-2">
          <dt className="font-semibold uppercase tracking-wide text-gray-400">
            Eigenaar
          </dt>
          <dd>{eigenaarTypeLabel(pand.eigenaar_type)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
        <span className="text-gray-700">
          <strong className="font-bold text-gray-900">
            {pand.maatregelen_count}
          </strong>{" "}
          {pand.maatregelen_count === 1 ? "maatregel" : "maatregelen"}
        </span>
        <DeadlineBadge status={pand.deadline_status} compact />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Toegevoegd op {formatDate(pand.created_at)}
        </span>
        <Link
          to={`/panden/${pand.id}`}
          className="text-sm font-semibold text-brand-green hover:underline"
        >
          Pand bekijken →
        </Link>
      </div>
    </article>
  );
}
