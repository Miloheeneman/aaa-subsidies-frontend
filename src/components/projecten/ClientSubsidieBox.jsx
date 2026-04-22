import { AAA_LEX_FEE_RATE } from "../../lib/aaaLexContact.js";
import { formatEuro } from "../../lib/formatters.js";

export default function ClientSubsidieBox({ geschatteSubsidie }) {
  const gross = Number(geschatteSubsidie || 0);
  const fee = gross * AAA_LEX_FEE_RATE;
  const net = Math.max(0, gross - fee);

  return (
    <section className="rounded-2xl border-2 border-brand-green/40 bg-brand-greenLight p-6 shadow-sm">
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-brand-greenDark">
        Indicatie voor uw situatie
      </h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-gray-700">Geschatte subsidie</dt>
          <dd className="text-xl font-extrabold text-brand-greenDark">
            ± {formatEuro(gross)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-brand-green/20 pt-3">
          <dt className="text-gray-700">AAA-Lex fee (8%)</dt>
          <dd className="font-semibold text-gray-900">{formatEuro(fee)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-brand-green/30 pt-3">
          <dt className="font-bold text-gray-900">U ontvangt netto (indicatie)</dt>
          <dd className="text-lg font-extrabold text-brand-greenDark">
            ± {formatEuro(net)}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-gray-600">
        Dit is een ruwe schatting; het definitieve bedrag volgt uit de RVO-beslissing
        en uw definitieve kosten.
      </p>
    </section>
  );
}
