/**
 * Brand-coloured spinner used across all async screens. Pass `label` to
 * announce the loading state to screen readers; pass `size` (sm/md/lg)
 * to scale it for inline buttons vs full-page wait states.
 */
const SIZE_CLASSES = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export default function LoadingSpinner({
  size = "md",
  label = "Laden...",
  className = "",
}) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 text-gray-600 ${className}`}
    >
      <span
        className={`inline-block animate-spin rounded-full border-brand-green border-t-transparent ${sizeClass}`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function FullPageSpinner({ label = "Laden..." }) {
  return (
    <div className="container-app flex flex-col items-center justify-center py-20 text-gray-600">
      <LoadingSpinner size="lg" label={label} />
      <div className="mt-3 text-sm font-medium">{label}</div>
    </div>
  );
}
