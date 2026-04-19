export default function SelectableCard({
  selected,
  onClick,
  title,
  description,
  icon,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative w-full rounded-xl border p-4 text-left transition ${
        selected
          ? "border-brand-green bg-brand-greenLight ring-2 ring-brand-green/30"
          : "border-gray-200 bg-white hover:border-brand-green hover:bg-brand-greenLight/50"
      }`}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className={`flex h-10 w-10 flex-none items-center justify-center rounded-lg text-lg ${
              selected
                ? "bg-brand-green text-white"
                : "bg-brand-greenLight text-brand-green group-hover:bg-brand-green group-hover:text-white"
            }`}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-900">{title}</div>
          {description && (
            <div className="mt-1 text-sm text-gray-600">{description}</div>
          )}
        </div>
        <div
          className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border transition ${
            selected
              ? "border-brand-green bg-brand-green text-white"
              : "border-gray-300 bg-white text-transparent"
          }`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            <path
              fillRule="evenodd"
              d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4L8.5 12l6.8-6.7a1 1 0 011.4 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}
