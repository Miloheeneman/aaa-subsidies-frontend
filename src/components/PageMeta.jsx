import { Helmet } from "react-helmet-async";

/**
 * Sets <title>, meta description, and Open Graph tags for a page so
 * social-share previews look on-brand.
 *
 * Usage:
 *   <PageMeta title="Subsidiecheck" description="..." />
 *
 * Title is automatically suffixed with " — AAA-Subsidies" unless the
 * caller passes the full title (e.g. for the homepage).
 */
const SITE_NAME = "AAA-Subsidies";

export default function PageMeta({
  title,
  description,
  fullTitle = false,
  noindex = false,
}) {
  const finalTitle = fullTitle ? title : title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  return (
    <Helmet>
      <title>{finalTitle}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={finalTitle} />
      {description && (
        <meta property="og:description" content={description} />
      )}
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={finalTitle} />
      {description && (
        <meta name="twitter:description" content={description} />
      )}
    </Helmet>
  );
}
