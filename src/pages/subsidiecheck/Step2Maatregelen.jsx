import SelectableCard from "./SelectableCard.jsx";

const OPTIONS = [
  {
    id: "warmtepomp",
    title: "Warmtepomp",
    description: "Lucht/water, water/water of hybride.",
    icon: "♨️",
  },
  {
    id: "isolatie",
    title: "Isolatie",
    description: "Dak, gevel, vloer of HR++ glas.",
    icon: "🧱",
  },
  {
    id: "energiesysteem",
    title: "Energiezuinig systeem",
    description: "LED-verlichting, efficiënte installaties.",
    icon: "💡",
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
    </div>
  );
}
