/** Statische AAA-Lex contactgegevens voor klantportal (geen ticket-systeem). */

const rawEmail = import.meta.env.VITE_AAA_LEX_CONTACT_EMAIL;
const rawPhone = import.meta.env.VITE_AAA_LEX_CONTACT_PHONE;

export const AAA_LEX_CONTACT_EMAIL =
  rawEmail && String(rawEmail).trim() ? String(rawEmail).trim() : "subsidies@aaa-lexoffices.nl";

export const AAA_LEX_CONTACT_PHONE =
  rawPhone && String(rawPhone).trim()
    ? String(rawPhone).trim()
    : "+31 (0)70 753 00 88";

export const AAA_LEX_FEE_RATE = 0.08;
