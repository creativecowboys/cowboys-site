/**
 * The small line under a business name in an Onboarding or Clients row (the contact person, then a city or a date).
 * Left out altogether when there is nothing to say: a contact that only repeats the business name is not printed
 * (see contactLine in src/lib/desk/names.ts).
 */
export function RowLine({ text }: { text: string }) {
  return text ? <small>{text}</small> : null;
}
