import { useState } from "react";

import PageMeta from "../../components/PageMeta.jsx";

const INITIAL = { name: "", email: "", phone: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Vul de verplichte velden in.");
      return;
    }
    setSubmitting(true);
    // Backend contact endpoint is nog niet gebouwd — we tonen alvast
    // een bevestiging in de UI en laten de integratie voor later.
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    setSent(true);
    setForm(INITIAL);
  }

  return (
    <>
      <PageMeta
        fullTitle
        title="Contact — AAA-Lex Offices"
        description="Neem contact op met AAA-Lex Offices. Gevestigd in Zoetermeer, bereikbaar op werkdagen van 9:00 tot 17:30."
      />

      <section className="bg-brand-greenLight">
        <div className="container-app py-14 md:py-20 text-center">
          <span className="inline-block rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-green">
            Contact
          </span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-gray-900 md:text-4xl">
            Neem contact op
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
            Heeft u een vraag over een energielabel, een meetstaat of een
            volledig verduurzamingstraject? We denken graag met u mee.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-app grid gap-10 py-16 md:grid-cols-5 md:py-20">
          <div className="md:col-span-3">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Stuur een bericht
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We nemen doorgaans binnen één werkdag contact met u op.
            </p>

            {sent ? (
              <div className="mt-8 rounded-2xl border border-brand-green/30 bg-brand-greenLight p-6">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green text-white"
                  >
                    ✓
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">
                    Bedankt voor uw bericht
                  </h3>
                </div>
                <p className="mt-3 text-sm text-gray-700">
                  We hebben uw bericht ontvangen en nemen zo spoedig
                  mogelijk contact met u op.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-4 text-sm font-semibold text-brand-green hover:underline"
                >
                  Nog een bericht versturen
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <Field label="Naam" required>
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={onChange}
                    autoComplete="name"
                    className={INPUT_CLASSES}
                  />
                </Field>
                <Field label="E-mailadres" required>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={onChange}
                    autoComplete="email"
                    className={INPUT_CLASSES}
                  />
                </Field>
                <Field label="Telefoonnummer">
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    autoComplete="tel"
                    placeholder="+31 6 12345678"
                    className={INPUT_CLASSES}
                  />
                </Field>
                <Field label="Bericht" required>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={onChange}
                    className={INPUT_CLASSES}
                    placeholder="Vertel kort over uw project of vraag."
                  />
                </Field>

                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {error}
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Verzenden…" : "Verstuur bericht"}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Door dit formulier te verzenden gaat u ermee akkoord dat
                  wij uw gegevens gebruiken om u te kunnen contacteren.
                </p>
              </form>
            )}
          </div>

          <aside className="md:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-lg font-bold text-gray-900">
                Contactgegevens
              </h2>
              <address className="mt-4 space-y-1 text-sm not-italic text-gray-700">
                <div className="font-semibold text-gray-900">
                  AAA-Lex Offices B.V.
                </div>
                <div>Rokkeveenseweg 40A</div>
                <div>2712 XZ Zoetermeer</div>
              </address>

              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <dt className="w-4 text-brand-green font-semibold">T:</dt>
                  <dd>
                    <a
                      href="tel:+31707530088"
                      className="text-gray-800 hover:underline"
                    >
                      +31 (0)70 – 753 00 88
                    </a>
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="w-4 text-brand-green font-semibold">E:</dt>
                  <dd>
                    <a
                      href="mailto:info@aaa-lexoffices.nl"
                      className="text-gray-800 hover:underline"
                    >
                      info@aaa-lexoffices.nl
                    </a>
                  </dd>
                </div>
              </dl>

              <div className="mt-5 rounded-lg bg-white p-4 text-sm text-gray-600 shadow-sm">
                <div className="font-semibold text-gray-900">
                  Openingstijden
                </div>
                <div className="mt-1">
                  Bereikbaar op werkdagen van{" "}
                  <span className="font-semibold text-gray-800">
                    09:00 tot 17:30
                  </span>
                  .
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

const INPUT_CLASSES =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30";

function Field({ label, required, hint, children }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-semibold text-gray-800">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </label>
  );
}
