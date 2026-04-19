export default function Step4Investering({ value, onChange }) {
  function update(patch) {
    onChange({ ...value, ...patch });
  }

  const offerteJa = value.offerte_beschikbaar === true;

  return (
    <div className="grid gap-5">
      <div>
        <label className="block text-sm font-semibold text-gray-800">
          Geschatte investering (€){" "}
          <span className="font-normal text-gray-500">(optioneel)</span>
        </label>
        <div className="relative mt-1.5">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            €
          </span>
          <input
            type="number"
            min={0}
            step={100}
            placeholder="bv. 9000"
            value={value.investering_bedrag ?? ""}
            onChange={(e) =>
              update({
                investering_bedrag:
                  e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-7 pr-3 text-gray-900 shadow-sm focus:border-brand-green focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          Geen exact bedrag nodig — een schatting is voldoende.
        </p>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-gray-800">
          Heeft u al een offerte?
        </legend>
        <div className="mt-2 inline-flex rounded-lg bg-gray-100 p-1">
          {[
            { id: true, label: "Ja" },
            { id: false, label: "Nee, nog niet" },
          ].map((opt) => (
            <button
              key={String(opt.id)}
              type="button"
              onClick={() => update({ offerte_beschikbaar: opt.id })}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                value.offerte_beschikbaar === opt.id
                  ? "bg-white text-brand-green shadow"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {offerteJa && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <strong>Let op:</strong> voor EIA / MIA / Vamil moet uw
            aanvraag binnen 3 maanden na ondertekening van de offerte
            zijn ingediend — daarna vervalt het recht.
          </div>
        )}
      </fieldset>

      <div>
        <label className="block text-sm font-semibold text-gray-800">
          Gewenste startdatum{" "}
          <span className="font-normal text-gray-500">(optioneel)</span>
        </label>
        <input
          type="date"
          value={value.gewenste_startdatum ?? ""}
          onChange={(e) => update({ gewenste_startdatum: e.target.value })}
          className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm focus:border-brand-green focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
        />
      </div>
    </div>
  );
}
