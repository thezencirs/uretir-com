export type ExplorerItem = {
  id: string;
  title: string;
  group: string;
  category: string;
  price: number | null;
  currency?: string;
  priceLabel: string;
  source: string;
  url: string;
  checkedAt: string;
  description?: string;
  notice?: string;
  facts: { label: string; value: string }[];
};
export type ExplorerData = {
  available: boolean;
  checkedAt: string | null;
  stats: { label: string; value: number }[];
  items: ExplorerItem[];
};
export function formatToolPrice(value: number | null, currency = "TRY") {
  if(value === null) return "Kaynakta belirtilmemiş";
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}
export function formatToolDate(value: string) {
  return new Date(value).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "short", timeStyle: "short" });
}
