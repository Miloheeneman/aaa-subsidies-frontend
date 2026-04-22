import {
  AAA_LEX_CONTACT_EMAIL,
  AAA_LEX_CONTACT_PHONE,
} from "../../lib/aaaLexContact.js";

export default function ClientContactCard() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Vragen over uw aanvraag?</h2>
      <p className="mt-2 text-sm text-gray-600">
        Neem gerust contact op met AAA-Lex — wij helpen u graag verder.
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        <li>
          <span className="text-gray-500">Telefoon: </span>
          <a
            href={`tel:${AAA_LEX_CONTACT_PHONE.replace(/\s/g, "")}`}
            className="font-semibold text-brand-green hover:underline"
          >
            {AAA_LEX_CONTACT_PHONE}
          </a>
        </li>
        <li>
          <span className="text-gray-500">E-mail: </span>
          <a
            href={`mailto:${AAA_LEX_CONTACT_EMAIL}`}
            className="font-semibold text-brand-green hover:underline"
          >
            {AAA_LEX_CONTACT_EMAIL}
          </a>
        </li>
      </ul>
    </section>
  );
}
