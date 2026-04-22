import { Link } from "react-router-dom";

import PageMeta from "../components/PageMeta.jsx";

export default function Contact() {
  return (
    <div className="container-app py-12 sm:py-16">
      <PageMeta title="Contact" />
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
        Contact AAA-Lex
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600">
        Heeft u al een offerte getekend of een bestelling geplaatst en wilt u
        weten of u nog in aanmerking komt voor subsidie of fiscale regelingen?
        Neem dan eerst contact met ons op.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href="mailto:info@aaa-lexoffices.nl"
          className="btn-primary inline-flex justify-center px-6 py-3 text-center"
        >
          E-mail: info@aaa-lexoffices.nl
        </a>
        <Link
          to="/"
          className="inline-flex justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-brand-green hover:text-brand-green"
        >
          ← Terug naar home
        </Link>
      </div>
    </div>
  );
}
