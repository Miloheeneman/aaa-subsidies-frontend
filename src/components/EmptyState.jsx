/**
 * Consistent empty-state block for list pages. Title is required; pass
 * `description` for context and an optional `action` (e.g. a Link/btn)
 * so the user has somewhere to go.
 */
export default function EmptyState({
  title,
  description,
  action = null,
  icon = null,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center ${className}`}
    >
      {icon ? (
        <div className="mb-4 text-brand-green">{icon}</div>
      ) : (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-greenLight text-2xl font-extrabold text-brand-green">
          —
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-gray-600">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
