const LABELS = ["A+++", "A++", "A+", "A", "B", "C", "D", "E", "F", "G"];

const PAND_TYPES = [
  { id: "woning", label: "Woning" },
  { id: "bedrijfspand", label: "Bedrijfspand" },
  { id: "maatschappelijk", label: "Maatschappelijk pand" },
];

const EIGENAAR_TYPES = [
  { id: "eigenaar_bewoner", label: "Eigenaar-bewoner" },
  { id: "verhuurder", label: "Verhuurder" },
  { id: "zakelijk", label: "Zakelijk" },
  { id: "vve", label: "VvE" },
];

export default function Step3Pand({ value, onChange }) {
  function update(patch) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="grid gap-5">
      <div>
        <label className="block text-sm font-semibold text-gray-800">
          Postcode
        </label>
        <input
          type="text"
          inputMode="text"
          autoComplete="postal-code"
          placeholder="1234 AB"
          value={value.postcode ?? ""}
          onChange={(e) => update({ postcode: e.target.value })}
          className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm focus:border-brand-green focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            Bouwjaar pand{" "}
            <span className="font-normal text-brand-green">*</span>
          </label>
          <input
            type="number"
            min={1500}
            max={2100}
            placeholder="bv. 1975"
            value={value.bouwjaar ?? ""}
            onChange={(e) =>
              update({
                bouwjaar: e.target.value === "" ? "" : Number(e.target.value),
              })
            }
            className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm focus:border-brand-green focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Verplicht voor de ISDE-check.
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            Huidig energielabel{" "}
            <span className="font-normal text-gray-500">(optioneel)</span>
          </label>
          <select
            value={value.energielabel ?? ""}
            onChange={(e) => update({ energielabel: e.target.value })}
            className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm focus:border-brand-green focus:ring-2 focus:ring-brand-green/30 focus:outline-none"
          >
            <option value="">Weet ik niet</option>
            {LABELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-gray-800">
          Type pand
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {PAND_TYPES.map((t) => (
            <label
              key={t.id}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm transition ${
                value.type_pand === t.id
                  ? "border-brand-green bg-brand-greenLight font-semibold text-brand-green"
                  : "border-gray-200 bg-white text-gray-800 hover:border-brand-green hover:bg-brand-greenLight/50"
              }`}
            >
              <input
                type="radio"
                name="type_pand"
                className="accent-brand-green"
                checked={value.type_pand === t.id}
                onChange={() => update({ type_pand: t.id })}
              />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-gray-800">
          Type eigenaar
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {EIGENAAR_TYPES.map((t) => (
            <label
              key={t.id}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm transition ${
                value.type_eigenaar === t.id
                  ? "border-brand-green bg-brand-greenLight font-semibold text-brand-green"
                  : "border-gray-200 bg-white text-gray-800 hover:border-brand-green hover:bg-brand-greenLight/50"
              }`}
            >
              <input
                type="radio"
                name="type_eigenaar"
                className="accent-brand-green"
                checked={value.type_eigenaar === t.id}
                onChange={() => update({ type_eigenaar: t.id })}
              />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
