/**
 * Reusable grey rounded rectangle used in place of imagery on the
 * public marketing pages while the design is still being iterated.
 *
 * Usage:
 *   <Placeholder className="aspect-[4/3]" />
 *   <Placeholder label="Teamfoto" className="h-64" />
 */
export default function Placeholder({
  label = "Afbeelding",
  className = "",
  rounded = "rounded-2xl",
  tone = "neutral",
}) {
  const toneClasses =
    tone === "dark"
      ? "bg-gray-800 text-gray-300 border-gray-700"
      : "bg-gray-100 text-gray-400 border-gray-200";
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative flex w-full items-center justify-center overflow-hidden border ${toneClasses} ${rounded} ${className}`}
    >
      {/* Subtle diagonal stripe so the placeholder reads as a frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.6]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent 0 22px, rgba(0,0,0,0.025) 22px 23px)",
        }}
      />
      <div className="relative flex flex-col items-center gap-1 text-xs font-medium tracking-wide">
        <svg
          aria-hidden="true"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-70"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <span>{label}</span>
      </div>
    </div>
  );
}
