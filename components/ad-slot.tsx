export type AdSlotFormat = "leaderboard" | "infeed" | "sidebar";

export function AdSlot({ format = "infeed", label = "Reklam alanı" }: { format?: AdSlotFormat; label?: string }) {
  return <aside className={`ad-slot ad-slot--${format}`} data-ad-format={format} aria-label={label}>
    <span className="ad-slot__label">{label}</span>
    <span className="ad-slot__note">İçeriği destekleyen seçilmiş iş birlikleri için ayrılmış alan</span>
  </aside>;
}

