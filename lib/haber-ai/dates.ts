export function newsDay(value: string | Date = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul" }).format(new Date(value));
}
