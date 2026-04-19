export default function ProgressBar({ step, totalSteps }) {
  const pct = Math.round((step / totalSteps) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
        <span className="uppercase tracking-wide text-brand-green">
          Stap {step} van {totalSteps}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-greenLight">
        <div
          className="h-full rounded-full bg-brand-green transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
