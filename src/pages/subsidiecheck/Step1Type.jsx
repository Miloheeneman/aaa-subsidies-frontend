import SelectableCard from "./SelectableCard.jsx";

const OPTIONS = [
  {
    id: "particulier",
    title: "Particulier",
    description: "Eigenaar-bewoner van een woning.",
    icon: "🏠",
  },
  {
    id: "zakelijk",
    title: "Zakelijk verhuurder",
    description: "U verhuurt één of meerdere panden.",
    icon: "🏘️",
  },
  {
    id: "vve",
    title: "VvE",
    description: "Vereniging van Eigenaren.",
    icon: "🏢",
  },
  {
    id: "maatschappelijk",
    title: "Maatschappelijk vastgoed",
    description: "Zorg, onderwijs, sport, gemeenten.",
    icon: "🏛️",
  },
  {
    id: "ondernemer",
    title: "Ondernemer / bedrijf",
    description: "IB- of VPB-plichtige onderneming.",
    icon: "🏭",
  },
];

export default function Step1Type({ value, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {OPTIONS.map((opt) => (
        <SelectableCard
          key={opt.id}
          selected={value === opt.id}
          onClick={() => onChange(opt.id)}
          title={opt.title}
          description={opt.description}
          icon={opt.icon}
        />
      ))}
    </div>
  );
}
