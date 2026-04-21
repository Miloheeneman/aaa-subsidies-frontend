import SelectableCard from "./SelectableCard.jsx";

const OPTIONS = [
  {
    id: "warmtepomp",
    title: "Warmtepomp",
    description: "Lucht/water, water/water of hybride.",
    icon: "♨️",
    hint: "Nieuw apparaat, geïnstalleerd door een gecertificeerd installateur vereist.",
  },
  {
    id: "isolatie",
    title: "Isolatie",
    description: "Dak, gevel, vloer of HR++ glas.",
    icon: "🧱",
    hint: "Foto's tijdens de werkzaamheden verplicht — naam, merk en dikte van het materiaal moeten zichtbaar zijn.",
  },
  {
    id: "energiesysteem",
    title: "Energiezuinig systeem",
    description: "LED-verlichting, efficiënte installaties.",
    icon: "💡",
    hint: "EIA — vraag aan VÓÓR u de offerte ondertekent.",
  },
  {
    id: "meerdere",
    title: "Meerdere of nog onbekend",
    description: "Ik wil meerdere maatregelen of weet het nog niet.",
    icon: "✨",
  },
];

export default function Step2Maatregelen({ value, onChange }) {
  function toggle(id) {
    if (id === "meerdere") {
      // "meerdere" is exclusive
      onChange(value.includes("meerdere") ? [] : ["meerdere"]);
      return;
    }
    const next = value.filter((v) => v !== "meerdere");
    if (next.includes(id)) {
      onChange(next.filter((v) => v !== id));
    } else {
      onChange([...next, id]);
    }
  }

  const hints = OPTIONS.filter(
    (o) => o.hint && value.includes(o.id),
  );

  return (
    <div>
      <p className="mb-4 text-sm text-gray-600">
        U kunt meerdere maatregelen selecteren.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <SelectableCard
            key={opt.id}
            selected={value.includes(opt.id)}
            onClick={() => toggle(opt.id)}
            title={opt.title}
            description={opt.description}
            icon={opt.icon}
          />
        ))}
      </div>

      {hints.length > 0 && (
        <div className="mt-5 rounded-lg border border-brand-green/20 bg-brand-greenLight/60 p-4 text-sm text-gray-800">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-green">
            Let op bij uw selectie
          </div>
          <ul className="space-y-1.5">
            {hints.map((h) => (
              <li key={h.id} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-white text-xs font-bold text-brand-green"
                >
                  !
                </span>
                <span>
                  <span className="font-semibold">{h.title}:</span> {h.hint}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
