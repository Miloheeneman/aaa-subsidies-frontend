import { Link } from "react-router-dom";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-brand-greenLight px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex justify-center">
          <img
            src="/aaa-subsidies-logo.svg"
            alt="AAA-Subsidies"
            className="h-[52px] w-auto"
          />
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 sm:p-8">
          <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <div className="mt-4 text-center text-sm text-gray-600">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      {children}
    </div>
  );
}

export function FormSuccess({ children }) {
  if (!children) return null;
  return (
    <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
      {children}
    </div>
  );
}

export function Field({ label, children, hint, required }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-800">
        {label} {required && <span className="text-brand-green">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

export const INPUT_CLASSES =
  "mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm focus:border-brand-green focus:ring-2 focus:ring-brand-green/30 focus:outline-none";
