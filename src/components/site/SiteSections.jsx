import { Link } from "react-router-dom";

import Placeholder from "./Placeholder.jsx";

/** Dark-green full-width CTA banner. */
export function CtaBanner({
  title,
  description,
  primary,
  secondary,
  tone = "green",
}) {
  const bg = tone === "green" ? "bg-brand-green" : "bg-gray-900";
  return (
    <section className={`${bg} text-white`}>
      <div className="container-app flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:py-16">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-extrabold md:text-3xl">{title}</h2>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-white/85 md:text-base">
              {description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {primary && (
            <Link
              to={primary.to}
              className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-green shadow-sm transition hover:bg-brand-greenLight"
            >
              {primary.label}
            </Link>
          )}
          {secondary && (
            <Link
              to={secondary.to}
              className="inline-flex items-center justify-center rounded-lg border border-white/60 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Hero used on dienst-detail + generic info pages. Title on the left,
 * placeholder image on the right. Pass ``eyebrow`` to show a small
 * pill above the title.
 */
export function ServiceHero({
  eyebrow,
  title,
  description,
  ctaPrimary,
  ctaSecondary,
  placeholderLabel = "Afbeelding",
}) {
  return (
    <section className="bg-brand-greenLight">
      <div className="container-app grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        <div>
          {eyebrow && (
            <span className="inline-block rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-gray-900 md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-base leading-relaxed text-gray-700 md:text-lg">
              {description}
            </p>
          )}
          {(ctaPrimary || ctaSecondary) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {ctaPrimary && (
                <Link to={ctaPrimary.to} className="btn-primary">
                  {ctaPrimary.label}
                </Link>
              )}
              {ctaSecondary && (
                <Link to={ctaSecondary.to} className="btn-secondary">
                  {ctaSecondary.label}
                </Link>
              )}
            </div>
          )}
        </div>
        <div>
          <Placeholder
            label={placeholderLabel}
            className="aspect-[4/3] shadow-sm"
          />
        </div>
      </div>
    </section>
  );
}

/** Two-column "content + aside" block used across dienst pages. */
export function SplitSection({
  title,
  children,
  aside,
  placeholderLabel = "Afbeelding",
  reverse = false,
}) {
  return (
    <section className="bg-white">
      <div className="container-app grid items-start gap-10 py-14 md:grid-cols-2 md:py-20">
        <div className={reverse ? "md:order-2" : ""}>
          {title && (
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
              {title}
            </h2>
          )}
          <div className="mt-4 space-y-4 text-base leading-relaxed text-gray-700">
            {children}
          </div>
        </div>
        <div className={reverse ? "md:order-1" : ""}>
          {aside || (
            <Placeholder
              label={placeholderLabel}
              className="aspect-[4/3] shadow-sm"
            />
          )}
        </div>
      </div>
    </section>
  );
}

/** Bullet list with green check marks. */
export function CheckList({ items }) {
  return (
    <ul className="mt-4 space-y-2 text-base text-gray-700">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-greenLight text-brand-green"
          >
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Numbered step indicator row. */
export function StepList({ steps }) {
  return (
    <ol className="grid gap-6 md:grid-cols-3">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-green text-sm font-bold text-white">
            {i + 1}
          </span>
          <h3 className="mt-4 text-lg font-bold text-gray-900">
            {step.title}
          </h3>
          {step.body && (
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {step.body}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
